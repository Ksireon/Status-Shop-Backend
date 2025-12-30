import { Injectable, HttpException } from '@nestjs/common'
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
    const base = {
      name: typeof body.name === 'object' ? body.name : { en: String(body.name || '') },
      description: typeof body.description === 'object' ? body.description : { en: String(body.description || '') },
      type: String(body.type || ''),
      image: String(body.image || ''),
      color: String(body.color || ''),
      price: Number(body.price || 0),
      tag: String(body.tag || ''),
      category_id: body.category_id ? Number(body.category_id) : null,
      created_at: new Date().toISOString(),
    }
    const newCols: any = {
      amount: Number(body.amount || 0),
      characteristic: String(body.characteristic || ''),
      type_i18n: typeof body.type_i18n === 'object' ? body.type_i18n : null,
      color_i18n: typeof body.color_i18n === 'object' ? body.color_i18n : null,
      characteristic_i18n: typeof body.characteristic_i18n === 'object' ? body.characteristic_i18n : null,
    }
    const oldCols = { meters: Number(body.amount || 0), size: String(body.characteristic || '') }
    if (!base.tag) throw new Error('tag is required')
    Object.keys(newCols).forEach((k) => {
      if (newCols[k] === null) delete newCols[k]
    })
    let data: any = null
    let errMsg: string | null = null
    {
      const { data: d, error: e } = await this.supabase.admin.from('products').insert({ ...base, ...newCols }).select('*').single()
      data = d
      errMsg = e?.message || null
    }
    if (!data && errMsg) {
      const needsFallback =
        /column .*amount/i.test(errMsg) ||
        /column .*characteristic/i.test(errMsg) ||
        /column .*type_i18n/i.test(errMsg) ||
        /column .*color_i18n/i.test(errMsg) ||
        /column .*characteristic_i18n/i.test(errMsg) ||
        /undefined column/i.test(errMsg) ||
        /does not exist/i.test(errMsg)
      if (needsFallback) {
        const { data: d2, error: e2 } = await this.supabase.admin.from('products').insert({ ...base, ...oldCols }).select('*').single()
        if (e2) throw new HttpException(e2.message || 'Insert failed', 500)
        data = d2
      } else {
        throw new HttpException(errMsg || 'Insert failed', 500)
      }
    }
    if (base.category_id && base.tag) {
      const { data: cat } = await this.supabase.admin.from('categories').select('id,tags').eq('id', base.category_id).single()
      const tagsArr = Array.isArray((cat as any)?.tags) ? (((cat as any).tags as any[]) ?? []) : []
      const newTags = Array.from(new Set([...tagsArr, base.tag]))
      await this.supabase.admin.from('categories').update({ tags: newTags }).eq('id', base.category_id)
    }
    return data
  }
}
