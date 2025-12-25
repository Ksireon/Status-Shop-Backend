import { Injectable } from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'

@Injectable()
export class SettingsService {
  constructor(private readonly supabase: SupabaseService) {}

  async list() {
    const { data, error } = await this.supabase.admin
      .from('settings')
      .select('*')
    if (error) throw error
    // Transform to object for easier consumption
    const settings = {}
    data.forEach(item => {
      settings[item.key] = item.value
    })
    return settings
  }
}
