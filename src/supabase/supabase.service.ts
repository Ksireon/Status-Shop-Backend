import { Injectable } from '@nestjs/common'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { ConfigService } from '../config/config.service'

@Injectable()
export class SupabaseService {
  readonly anon: SupabaseClient
  readonly admin: SupabaseClient
  constructor(private readonly cfg: ConfigService) {
    const url = this.cfg.getRequired('SUPABASE_URL')
    const anonKey = this.cfg.getRequired('SUPABASE_ANON_KEY')
    const serviceKey = this.cfg.getRequired('SUPABASE_SERVICE_ROLE_KEY')
    this.anon = createClient(url, anonKey)
    this.admin = createClient(url, serviceKey)
  }
}
