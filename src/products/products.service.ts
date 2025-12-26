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

  async create(body: any) {
    const payload = {
      name: typeof body.name === 'object' ? body.name : { en: String(body.name || '') },
      description: typeof body.description === 'object' ? body.description : { en: String(body.description || '') },
      type: String(body.type || ''),
      image: String(body.image || ''),
      color: String(body.color || ''),
      price: Number(body.price || 0),
      amount: Number(body.amount || 0),
      characteristic: String(body.characteristic || ''),
      tag: String(body.tag || ''),
      category_id: body.category_id ? Number(body.category_id) : null,
      created_at: new Date().toISOString(),
    }
    if (!payload.tag) throw new Error('tag is required')
    const { data, error } = await this.supabase.admin.from('products').insert(payload).select('*').single()
    if (error) throw error
    if (payload.category_id && payload.tag) {
      const { data: cat } = await this.supabase.admin.from('categories').select('id,tags').eq('id', payload.category_id).single()
      const tagsArr = Array.isArray((cat as any)?.tags) ? (((cat as any).tags as any[]) ?? []) : []
      const newTags = Array.from(new Set([...tagsArr, payload.tag]))
      await this.supabase.admin.from('categories').update({ tags: newTags }).eq('id', payload.category_id)
    }
    return data
  }
}
