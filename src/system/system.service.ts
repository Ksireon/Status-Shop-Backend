import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '../config/config.service'
import { SupabaseService } from '../supabase/supabase.service'
import { Client } from 'pg'

@Injectable()
export class SystemService {
  constructor(private readonly cfg: ConfigService, private readonly supabase: SupabaseService) {}

  async ensureBranchesTable() {
    const dbUrl = this.cfg.get('SUPABASE_DB_URL')
    if (!dbUrl) {
      throw new InternalServerErrorException('SUPABASE_DB_URL is not configured')
    }
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
    return { ok: true }
  }
}

