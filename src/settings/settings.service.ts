import { Injectable } from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'

interface Setting {
  key: string
  value: unknown
}

@Injectable()
export class SettingsService {
  constructor(private readonly supabase: SupabaseService) {}

  async list() {
    const { data, error } = await this.supabase.admin
      .from('settings')
      .select('key,value')
    if (error) throw error
    // Transform to object for easier consumption
    const settings: Record<string, unknown> = {}
    const rows = (data ?? []) as Setting[]
    for (const item of rows) {
      settings[item.key] = item.value
    }
    return settings
  }
}
