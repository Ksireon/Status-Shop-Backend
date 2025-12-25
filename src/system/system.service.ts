import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'
import { ConfigService } from '../config/config.service'
import { Client } from 'pg'

@Injectable()
export class SystemService {
  constructor(private readonly supabase: SupabaseService, private readonly cfg: ConfigService) {}

  async ensureBranchesTable() {
    // сначала проверяем существование
    const { data: exists, error: existsErr } = await this.supabase.admin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'branches')
      .limit(1)
    if (!existsErr && (exists || []).length > 0) {
      return { ok: true }
    }
    // пробуем создать через RPC-функцию ensure_branches (должна быть создана миграцией)
    const created = await this.supabase.admin.rpc('ensure_branches')
    if (!created.error) {
      return { ok: true, via: 'rpc' }
    }
    // если RPC отсутствует — пробуем прямое подключение (SUPABASE_DB_URL)
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
    // нет RPC и нет DB URL
    throw new InternalServerErrorException('Таблица public.branches отсутствует, RPC ensure_branches не найдена и SUPABASE_DB_URL не настроен')
  }
}
