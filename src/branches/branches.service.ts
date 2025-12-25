import { Injectable } from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'

@Injectable()
export class BranchesService {
  constructor(private readonly supabase: SupabaseService) {}

  async list() {
    const { data, error } = await this.supabase.admin
      .from('branches')
      .select('*')
      .order('name')
    if (error) throw error
    return data
  }
}
