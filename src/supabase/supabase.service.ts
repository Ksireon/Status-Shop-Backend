import { Injectable } from '@nestjs/common'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { ConfigService } from '../config/config.service'
import { SupabaseRefreshResponse } from './supabase.types'

@Injectable()
export class SupabaseService {
  readonly anon: SupabaseClient
  readonly admin: SupabaseClient
  private readonly url: string
  private readonly anonKey: string
  constructor(private readonly cfg: ConfigService) {
    const url = this.cfg.getRequired('SUPABASE_URL')
    const anonKey = this.cfg.getRequired('SUPABASE_ANON_KEY')
    const serviceKey = this.cfg.getRequired('SUPABASE_SERVICE_ROLE_KEY')
    this.url = url
    this.anonKey = anonKey
    this.anon = createClient(url, anonKey)
    this.admin = createClient(url, serviceKey)
  }

  async refreshSession(refresh_token: string): Promise<SupabaseRefreshResponse> {
    const res = await fetch(`${this.url}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: this.anonKey,
        Authorization: `Bearer ${this.anonKey}`,
      },
      body: JSON.stringify({ refresh_token }),
    })

    if (!res.ok) {
      const body = await res.text()
      throw new Error(body || `Supabase refresh error (${res.status})`)
    }

    return (await res.json()) as SupabaseRefreshResponse
  }
}
