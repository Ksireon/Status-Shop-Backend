import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'
import { ConfigService } from '../config/config.service'
import { Client } from 'pg'
import { resolve4 } from 'node:dns/promises'

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
    const u = new URL(dbUrl)
    let addr4 = u.hostname
    try {
      const arr = await resolve4(u.hostname)
      if (arr && arr.length > 0) addr4 = arr[0]
    } catch {}
    const baseCfg = {
      host: addr4,
      port: u.port ? parseInt(u.port, 10) : 5432,
      database: u.pathname.replace(/^\//, ''),
      user: decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
      ssl: { rejectUnauthorized: false } as const,
    }
    let client = new Client(baseCfg)
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
          if not exists (select 1 from pg_policies where schemaname='public' and tablename='chat_messages' and policyname='chat_messages_read_all') then
            create policy chat_messages_read_all on public.chat_messages for select to anon using (true);
          end if;
          if not exists (select 1 from pg_policies where schemaname='public' and tablename='chat_messages' and policyname='chat_messages_insert_all') then
            create policy chat_messages_insert_all on public.chat_messages for insert to anon with check (true);
          end if;
        end $$;
        do $$ begin
          begin
            alter publication supabase_realtime add table public.chat_messages;
          exception when others then null;
          end;
        end $$;
      `)
    } catch (e: any) {
      const msg = e?.message || ''
      try {
        client.end().catch(() => {})
        client = new Client({ ...baseCfg, port: 6543 })
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
            if not exists (select 1 from pg_policies where schemaname='public' and tablename='chat_messages' and policyname='chat_messages_read_all') then
              create policy chat_messages_read_all on public.chat_messages for select to anon using (true);
            end if;
            if not exists (select 1 from pg_policies where schemaname='public' and tablename='chat_messages' and policyname='chat_messages_insert_all') then
              create policy chat_messages_insert_all on public.chat_messages for insert to anon with check (true);
            end if;
          end $$;
          do $$ begin
            begin
              alter publication supabase_realtime add table public.chat_messages;
            exception when others then null;
            end;
          end $$;
        `)
        await client.end()
        return { ok: true, via: 'pg' }
      } catch (e2: any) {
        const supaUrl = this.cfg.get('SUPABASE_URL')
        const access = this.cfg.get('SUPABASE_ACCESS_TOKEN')
        if (supaUrl && access) {
          try {
            const ref = new URL(supaUrl).hostname.split('.')[0]
            const api = `https://api.supabase.com/v1/projects/${ref}/database/query`
            const sql = `
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
                if not exists (select 1 from pg_policies where schemaname='public' and tablename='chat_messages' and policyname='chat_messages_read_all') then
                  create policy chat_messages_read_all on public.chat_messages for select to anon using (true);
                end if;
                if not exists (select 1 from pg_policies where schemaname='public' and tablename='chat_messages' and policyname='chat_messages_insert_all') then
                  create policy chat_messages_insert_all on public.chat_messages for insert to anon with check (true);
                end if;
              end $$;
              do $$ begin
                begin
                  alter publication supabase_realtime add table public.chat_messages;
                exception when others then null;
                end;
              end $$;
            `
            const res = await fetch(api, {
              method: 'POST',
              headers: { Authorization: `Bearer ${access}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({ query: sql }),
            })
            if (res.ok) return { ok: true, via: 'sql' }
          } catch {}
        }
        const { error } = await this.supabase.admin.rpc('ensure_chat_schema')
        if (!error) return { ok: true, via: 'rpc' }
        throw new InternalServerErrorException(error?.message || e2?.message || msg || 'Initialization failed')
      }
    } finally {
      await client.end()
    }
    return { ok: true, via: 'pg' }
  }
}
