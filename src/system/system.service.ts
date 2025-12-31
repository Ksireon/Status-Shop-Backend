import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'
import { ConfigService } from '../config/config.service'
import { Client } from 'pg'

@Injectable()
export class SystemService {
  constructor(private readonly supabase: SupabaseService, private readonly cfg: ConfigService) {}

  async ensureBranchesTable() {
    const { data: exists, error: existsErr } = await this.supabase.admin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'branches')
      .limit(1)
    if (!existsErr && (exists || []).length > 0) {
      return { ok: true }
    }
    const created = await this.supabase.admin.rpc('ensure_branches')
    if (!created.error) {
      return { ok: true, via: 'rpc' }
    }
    const dbUrl = this.cfg.get('SUPABASE_DB_URL')
    if (dbUrl) {
      const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } })
      await client.connect()
      try {
        await client.query(`
          create extension if not exists pgcrypto;
          create table if not exists public.branches (
            id uuid primary key default gen_random_uuid(),
            name text not null,
            city text,
            address text,
            coords text,
            phone text,
            card_number text,
            manager_user_id uuid,
            created_at timestamptz default now()
          );
        `)
      } finally {
        await client.end()
      }
      return { ok: true, via: 'pg' }
    }
    throw new InternalServerErrorException('Таблица public.branches отсутствует, RPC ensure_branches не найдена и SUPABASE_DB_URL не настроен')
  }

  async ensureProductsSchema() {
    const dbUrl = this.cfg.get('SUPABASE_DB_URL')
    if (!dbUrl) throw new InternalServerErrorException('SUPABASE_DB_URL не настроен')
    const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } })
    await client.connect()
    try {
      await client.query(`
        alter table if exists public.products
          add column if not exists amount numeric(12,2) default 0 not null,
          add column if not exists characteristic text default '' not null;
      `)
      await client.query(`do $$ begin begin alter table public.products drop column if exists meters; exception when undefined_column then null; end; end $$;`)
      await client.query(`do $$ begin begin alter table public.products drop column if exists size; exception when undefined_column then null; end; end $$;`)
    } finally {
      await client.end()
    }
    return { ok: true }
  }

  async ensureCategories() {
    const dbUrl = this.cfg.get('SUPABASE_DB_URL')
    if (!dbUrl) throw new InternalServerErrorException('SUPABASE_DB_URL не настроен')
    const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } })
    await client.connect()
    try {
      await client.query(`alter table if exists public.categories add column if not exists tags jsonb default '[]'::jsonb not null;`)
      await client.query(`
        insert into public.categories(name, sort_order) values
          ('{"en":"Clothing"}'::jsonb,1),
          ('{"en":"Electronics"}'::jsonb,2),
          ('{"en":"Home"}'::jsonb,3),
          ('{"en":"Sports"}'::jsonb,4),
          ('{"en":"Accessories"}'::jsonb,5)
        on conflict do nothing;
      `)
    } finally {
      await client.end()
    }
    return { ok: true }
  }

  async ensureChatSchema() {
    const dbUrl = this.cfg.get('SUPABASE_DB_URL')
    if (!dbUrl) throw new InternalServerErrorException('SUPABASE_DB_URL не настроен')
    const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } })
    await client.connect()
    try {
      await client.query(`
        create extension if not exists pgcrypto;
        create table if not exists public.chat_rooms (
          id uuid primary key default gen_random_uuid(),
          user_id uuid not null,
          assigned_role text check (assigned_role in ('owner','director','manager')),
          status text not null default 'open',
          last_message_at timestamptz,
          created_at timestamptz not null default now()
        );
        create index if not exists idx_chat_rooms_user on public.chat_rooms(user_id);
        create index if not exists idx_chat_rooms_last on public.chat_rooms(last_message_at);
        create table if not exists public.chat_messages (
          id uuid primary key default gen_random_uuid(),
          room_id uuid not null references public.chat_rooms(id) on delete cascade,
          sender_type text not null check (sender_type in ('user','staff')),
          sender_id uuid,
          content text not null,
          created_at timestamptz not null default now()
        );
        create index if not exists idx_chat_messages_room on public.chat_messages(room_id);
        create index if not exists idx_chat_messages_created on public.chat_messages(created_at);
      `)
    } finally {
      await client.end()
    }
    return { ok: true }
  }
}
