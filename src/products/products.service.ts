import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { Client } from 'pg'
import { SupabaseService } from '../supabase/supabase.service'
import { ConfigService } from '../config/config.service'

@Injectable()
export class ProductsService {
  constructor(private readonly supabase: SupabaseService, private readonly cfg: ConfigService) {}

  private isTagTypeMismatch(err: any) {
    const msg = String(err?.message || '').toLowerCase()
    return msg.includes('operator does not exist') || msg.includes('invalid input syntax') || msg.includes('could not find the') || msg.includes('cannot cast')
  }

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

  async getStockByTag(tag: string) {
    const t = String(tag || '').trim()
    if (!t) throw new BadRequestException('tag is required')

    const dbUrl = this.cfg.get('SUPABASE_DB_URL')
    if (dbUrl) {
      const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } })
      await client.connect()
      try {
        const col = await client.query(
          `select data_type from information_schema.columns where table_schema='public' and table_name='products' and column_name='tag' limit 1;`,
        )
        const dataType = String(col.rows?.[0]?.data_type || '').toLowerCase()
        if (dataType === 'json' || dataType === 'jsonb') {
          const jsonString = JSON.stringify(t)
          const res = await client.query(
            `select amount from public.products
             where (tag->>'en' = $1 or tag->>'ru' = $1 or tag->>'uz' = $1 or tag::text = $2)
             limit 1;`,
            [t, jsonString],
          )
          if (res.rows.length === 0) throw new NotFoundException('Product not found')
          return { amount: res.rows[0].amount }
        }

        const res = await client.query(`select amount from public.products where tag = $1 limit 1;`, [t])
        if (res.rows.length === 0) throw new NotFoundException('Product not found')
        return { amount: res.rows[0].amount }
      } finally {
        await client.end()
      }
    }

    const tagExprs = ['tag', 'tag->>en', 'tag->>ru', 'tag->>uz']
    let lastErr: any = null
    for (const expr of tagExprs) {
      const admin: any = this.supabase.admin as any
      const { data, error } = await admin
        .from('products')
        .select('amount')
        .eq(expr, t)
        .limit(1)
        .maybeSingle()

      if (error) {
        lastErr = error
        if (this.isTagTypeMismatch(error)) continue
        throw error
      }
      if (data) return { amount: (data as any).amount }
    }

    if (lastErr) throw lastErr
    throw new NotFoundException('Product not found')
  }
}
