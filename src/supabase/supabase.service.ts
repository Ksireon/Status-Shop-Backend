import { Injectable } from '@nestjs/common'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { ConfigService } from '../config/config.service'

@Injectable()
export class SupabaseService {
  private _anon?: SupabaseClient
  private _admin?: SupabaseClient
  constructor(private readonly cfg: ConfigService) {}
  get anon(): SupabaseClient {
    if (!this._anon) {
      const url = this.cfg.get('SUPABASE_URL') || this.cfg.get('NEXT_PUBLIC_SUPABASE_URL')
      const anonKey = this.cfg.get('SUPABASE_ANON_KEY') || this.cfg.get('NEXT_PUBLIC_SUPABASE_ANON_KEY')
      if (!url || !anonKey) throw new Error('Supabase anon client is not configured')
      this._anon = createClient(url, anonKey)
    }
    return this._anon
  }
  get admin(): SupabaseClient {
    if (!this._admin) {
      const url = this.cfg.get('SUPABASE_URL') || this.cfg.get('NEXT_PUBLIC_SUPABASE_URL')
      const serviceKey = this.cfg.get('SUPABASE_SERVICE_ROLE_KEY')
      if (!url || !serviceKey) throw new Error('Supabase service client is not configured')
      this._admin = createClient(url, serviceKey)
    }
    return this._admin
  }
}
