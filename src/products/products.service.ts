import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
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
      type: typeof body.type === 'object' ? body.type : { en: String(body.type || '') },
      image: String(body.image || ''),
      color: typeof body.color === 'object' ? body.color : { en: String(body.color || '') },
      price: Number(body.price || 0),
      amount: Number(body.amount || 0),
      characteristic: typeof body.characteristic === 'object' ? body.characteristic : { en: String(body.characteristic || '') },
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
    // try to derive category by type.en if category_id not provided
    if (!payload.category_id) {
      const typeName = (payload.type as any)?.en ? String((payload.type as any).en).trim() : ''
      if (typeName) {
        const { data: cat } = await this.supabase.admin
          .from('categories')
          .select('id,tags,name,sort_order')
          .eq('name->>en', typeName)
          .limit(1)
          .maybeSingle()
        let catId = (cat as any)?.id as number | undefined
        if (!catId) {
          const created = await this.supabase.admin
            .from('categories')
            .insert({ name: { en: typeName }, sort_order: 0, tags: [] })
            .select('id')
            .single()
          catId = (created.data as any)?.id
        }
        if (catId) {
          const { data: current } = await this.supabase.admin.from('categories').select('tags').eq('id', catId).single()
          const tagsArr = Array.isArray((current as any)?.tags) ? (((current as any).tags as any[]) ?? []) : []
          const newTags = Array.from(new Set([...tagsArr, payload.tag]))
          await this.supabase.admin.from('categories').update({ tags: newTags }).eq('id', catId)
        }
      }
    }
    return data
  }

  async stockByTag(tag?: string) {
    const t = String(tag || '').trim()
    if (!t) throw new BadRequestException('tag is required')
    const { data, error } = await this.supabase.admin.from('products').select('amount').eq('tag', t).single()
    if (error) {
      const code = String((error as any)?.code || '')
      const msg = String((error as any)?.message || '')
      if (code === 'PGRST116') throw new NotFoundException('Product not found')
      throw new InternalServerErrorException(msg || 'Ошибка получения остатка')
    }
    return { tag: t, amount: (data as any)?.amount }
  }
}
