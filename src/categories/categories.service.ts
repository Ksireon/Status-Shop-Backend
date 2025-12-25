import { Injectable } from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'

@Injectable()
export class CategoriesService {
  constructor(private readonly supabase: SupabaseService) {}

  async list() {
    const { data, error } = await this.supabase.admin
      .from('categories')
      .select('*')
      .order('sort_order')
    if (error) throw error
    return data
  }
}
