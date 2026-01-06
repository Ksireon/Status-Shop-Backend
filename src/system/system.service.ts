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
          add column if not exists amount numeric(12,2) default 0 not null;
      `)

      await client.query(`
        do $$
        begin
          if exists (
            select 1 from information_schema.columns
            where table_schema='public' and table_name='products' and column_name='type'
          ) then
            if (select data_type from information_schema.columns where table_schema='public' and table_name='products' and column_name='type') <> 'jsonb' then
              alter table public.products alter column type type jsonb using jsonb_build_object('en', type);
            end if;
          end if;

          if exists (
            select 1 from information_schema.columns
            where table_schema='public' and table_name='products' and column_name='color'
          ) then
            if (select data_type from information_schema.columns where table_schema='public' and table_name='products' and column_name='color') <> 'jsonb' then
              alter table public.products alter column color type jsonb using jsonb_build_object('en', color);
            end if;
          end if;

          if exists (
            select 1 from information_schema.columns
            where table_schema='public' and table_name='products' and column_name='characteristic'
          ) then
            if (select data_type from information_schema.columns where table_schema='public' and table_name='products' and column_name='characteristic') <> 'jsonb' then
              alter table public.products alter column characteristic type jsonb using jsonb_build_object('en', characteristic);
            end if;
          else
            alter table public.products add column characteristic jsonb not null default '{}'::jsonb;
          end if;

          if exists (
            select 1 from information_schema.columns
            where table_schema='public' and table_name='products' and column_name='meters'
          ) then
            update public.products set amount = coalesce(amount, 0) + coalesce(meters, 0);
          end if;

          if exists (
            select 1 from information_schema.columns
            where table_schema='public' and table_name='products' and column_name='size'
          ) then
            update public.products
            set characteristic =
              case
                when characteristic is null or characteristic = '{}'::jsonb
                then jsonb_build_object('en', size)
                else characteristic || jsonb_build_object('en', size)
              end;
          end if;
        end $$;
      `)
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
    try {
      await client.connect()
      await client.query(`
        create extension if not exists pgcrypto;
        create table if not exists public.chat_rooms (
          id uuid primary key default gen_random_uuid(),
          user_id uuid not null,
          assigned_role text check (assigned_role in ('owner','director','manager')),
          status text not null default 'open',
          last_message_at timestamptz,
          created_at timestamptz not null default now(),
          assigned_staff_id uuid,
          closed_at timestamptz
        );
        create index if not exists idx_chat_rooms_user on public.chat_rooms(user_id);
        create index if not exists idx_chat_rooms_role on public.chat_rooms(assigned_role);
        create index if not exists idx_chat_rooms_staff on public.chat_rooms(assigned_staff_id);
        create index if not exists idx_chat_rooms_closed on public.chat_rooms(closed_at);
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
        alter table public.chat_rooms enable row level security;
        alter table public.chat_messages enable row level security;
        do $$ begin
          if not exists (select 1 from pg_policies where schemaname='public' and tablename='chat_rooms' and policyname='chat_rooms_read_all') then
            create policy chat_rooms_read_all on public.chat_rooms for select to anon using (true);
          end if;
          if not exists (select 1 from pg_policies where schemaname='public' and tablename='chat_rooms' and policyname='chat_rooms_insert_all') then
            create policy chat_rooms_insert_all on public.chat_rooms for insert to anon with check (user_id is not null);
          end if;
          if not exists (select 1 from pg_policies where schemaname='public' and tablename='chat_rooms' and policyname='chat_rooms_update_all') then
            create policy chat_rooms_update_all on public.chat_rooms for update to anon using (true) with check (true);
          end if;
          if not exists (select 1 from pg_policies where schemaname='public' and tablename='chat_messages' and policyname='chat_messages_read_all') then
            create policy chat_messages_read_all on public.chat_messages for select to anon using (true);
          end if;
          if not exists (select 1 from pg_policies where schemaname='public' and tablename='chat_messages' and policyname='chat_messages_insert_all') then
            create policy chat_messages_insert_all on public.chat_messages for insert to anon with check (true);
          end if;
        end $$;
        create or replace function public.chat_rooms_touch_last_message_at()
        returns trigger
        language plpgsql
        as $$
        begin
          update public.chat_rooms
            set last_message_at = new.created_at
            where id = new.room_id;
          return new;
        end;
        $$;
        drop trigger if exists trg_chat_messages_touch_room on public.chat_messages;
        create trigger trg_chat_messages_touch_room
        after insert on public.chat_messages
        for each row
        execute function public.chat_rooms_touch_last_message_at();
        create or replace function public.chat_messages_block_closed_room()
        returns trigger
        language plpgsql
        as $$
        declare
          v_status text;
        begin
          select status into v_status from public.chat_rooms where id = new.room_id;
          if v_status = 'closed' then
            raise exception 'Chat room is closed';
          end if;
          return new;
        end;
        $$;
        drop trigger if exists trg_chat_messages_block_closed_room on public.chat_messages;
        create trigger trg_chat_messages_block_closed_room
        before insert on public.chat_messages
        for each row
        execute function public.chat_messages_block_closed_room();
        do $$ begin
          begin
            alter publication supabase_realtime add table public.chat_messages;
          exception when others then null;
          end;
          begin
            alter publication supabase_realtime add table public.chat_rooms;
          exception when others then null;
          end;
        end $$;
      `)
    } catch (e: any) {
      throw new InternalServerErrorException(e?.message || 'PG initialization failed')
    } finally {
      await client.end()
    }
    return { ok: true, via: 'pg' }
  }
}
