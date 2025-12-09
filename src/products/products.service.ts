import { Injectable } from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'

@Injectable()
export class ProductsService {
  constructor(private readonly supabase: SupabaseService) {}

  async list(opts: { page: number, limit: number, sort: string, order: 'asc' | 'desc' }) {
    const from = (opts.page - 1) * opts.limit
    const to = from + opts.limit - 1
    const { data, error } = await this.supabase.admin
      .from('products')
      .select('*')
      .order(opts.sort, { ascending: opts.order === 'asc' })
      .range(from, to)
    if (error) throw error
    return data
  }
}
