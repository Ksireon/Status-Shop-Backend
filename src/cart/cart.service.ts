import { BadRequestException, ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common'
import { Client } from 'pg'
import { resolve4 } from 'node:dns/promises'
import { SupabaseService } from '../supabase/supabase.service'
import { CartItemDto } from './dto/cart-item.dto'
import { ConfigService } from '../config/config.service'

@Injectable()
export class CartService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly cfg: ConfigService,
  ) {}

  private stockColumn: 'amount' | null = null
  private tagType: 'text' | 'json' | 'jsonb' | null = null

  private normalizeTag(raw: unknown): string {
    const s = String(raw ?? '').trim()
    if (!s) return ''
    if (
      (s.startsWith('"') && s.endsWith('"')) ||
      s.startsWith('{') ||
      s.startsWith('[')
    ) {
      try {
        const parsed = JSON.parse(s)
        if (typeof parsed === 'string') return parsed.trim()
        if (parsed && typeof parsed === 'object') {
          const obj = parsed as Record<string, unknown>
          for (const k of ['tag', 'value', 'en', 'ru', 'uz']) {
            const v = obj[k]
            if (typeof v === 'string' && v.trim()) return v.trim()
          }
        }
      } catch (_) {}
    }
    return s
  }

  private async makePgClient(dbUrl: string) {
    const u = new URL(dbUrl)
    const host = u.hostname
    const port = u.port ? Number(u.port) : 5432
    const user = decodeURIComponent(u.username || '')
    const password = decodeURIComponent(u.password || '')
    const database = (u.pathname || '').replace(/^\//, '') || 'postgres'

    let hostIp = host
    try {
      const ips = await resolve4(host)
      if (ips && ips.length > 0) hostIp = ips[0]
    } catch (_) {}

    return new Client({
      host: hostIp,
      port,
      user,
      password,
      database,
      ssl: { rejectUnauthorized: false },
    })
  }

  private async resolveStockColumn(client: Client): Promise<'amount'> {
    if (this.stockColumn) return this.stockColumn
    const res = await client.query(
      `
        select column_name
        from information_schema.columns
        where table_schema = 'public'
          and table_name = 'products'
          and column_name = 'amount'
      `
    )
    if ((res.rows || []).length === 0) throw new InternalServerErrorException('products.amount column not found')
    this.stockColumn = 'amount'
    return 'amount'
  }

  private async resolveTagType(client: Client): Promise<'text' | 'json' | 'jsonb'> {
    if (this.tagType) return this.tagType
    const res = await client.query(
      `
        select data_type
        from information_schema.columns
        where table_schema = 'public'
          and table_name = 'products'
          and column_name = 'tag'
        limit 1
      `
    )
    const dataType = String((res.rows?.[0] as any)?.data_type || '').toLowerCase()
    const tagType = dataType === 'json' || dataType === 'jsonb' ? (dataType as 'json' | 'jsonb') : ('text' as const)
    this.tagType = tagType
    return tagType
  }

  private buildTagWhere(
    tagType: 'text' | 'json' | 'jsonb',
    productTagRaw: string,
    startIndex: number,
  ): { condition: string; params: any[]; nextIndex: number } {
    const productTagText = this.normalizeTag(productTagRaw)
    if (tagType === 'text') {
      return { condition: `tag = $${startIndex}`, params: [productTagText], nextIndex: startIndex + 1 }
    }

    const textParamIndex = startIndex
    const textParams: any[] = [productTagText]

    const commonKeyMatches = [
      `tag::jsonb #>> '{tag}' = $${textParamIndex}`,
      `tag::jsonb #>> '{value}' = $${textParamIndex}`,
      `tag::jsonb #>> '{en}' = $${textParamIndex}`,
      `tag::jsonb #>> '{ru}' = $${textParamIndex}`,
      `tag::jsonb #>> '{uz}' = $${textParamIndex}`,
      `tag::jsonb #>> '{uk}' = $${textParamIndex}`,
    ]

    let jsonParam: string | null = null
    try {
      const parsed = JSON.parse(productTagRaw)
      if (parsed && typeof parsed === 'object') {
        jsonParam = JSON.stringify(parsed)
      }
    } catch (_) {}

    if (!jsonParam) {
      const condition = `((tag #>> '{}') = $${textParamIndex} OR ${commonKeyMatches.join(' OR ')})`
      return { condition, params: textParams, nextIndex: startIndex + 1 }
    }

    const jsonParamIndex = startIndex + 1
    const condition = `((tag #>> '{}') = $${textParamIndex} OR ${commonKeyMatches.join(' OR ')} OR tag::jsonb @> $${jsonParamIndex}::jsonb)`
    return { condition, params: [...textParams, jsonParam], nextIndex: startIndex + 2 }
  }

  async list(uid: string, opts: { page: number, limit: number }) {
    const from = (opts.page - 1) * opts.limit
    const to = from + opts.limit - 1
    const { data, error } = await this.supabase.admin
      .from('cart_items')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: true })
      .range(from, to)
    if (error) throw error
    return data
  }

  async add(uid: string, item: CartItemDto) {
    const productTag = this.normalizeTag((item as any)?.product_tag)
    if (!productTag) throw new BadRequestException('product_tag is required')
    const cartTag = this.normalizeTag((item as any)?.tag)
    if (!cartTag) throw new BadRequestException('tag is required')
    const meters = Number((item as any)?.meters ?? 0)
    const quantity = Number((item as any)?.quantity ?? 0)
    const dec = Number.isFinite(meters) && meters > 0 ? meters : quantity
    if (!Number.isFinite(dec) || dec <= 0) throw new BadRequestException('quantity must be > 0')

    const dbUrl = this.cfg.get('SUPABASE_DB_URL')
    if (!dbUrl) throw new InternalServerErrorException('SUPABASE_DB_URL не настроен')

    const client = await this.makePgClient(dbUrl)
    await client.connect()

    let didBegin = false
    try {
      await client.query('begin')
      didBegin = true

      const stockCol = await this.resolveStockColumn(client)
      const tagType = await this.resolveTagType(client)
      const tagWhere = this.buildTagWhere(tagType, productTag, 1)
      const decParamIndex = tagWhere.nextIndex
      const updated = await client.query(
        `
          update public.products
          set ${stockCol} = ${stockCol} - $${decParamIndex}
          where ${tagWhere.condition} and ${stockCol} >= $${decParamIndex}
          returning ${stockCol}
        `,
        [...tagWhere.params, dec]
      )

      if (updated.rowCount === 0) {
        throw new ConflictException('Недостаточно товара на складе')
      }

      const inserted = await client.query(
        `
          insert into public.cart_items (user_id, data, tag, created_at)
          values ($1, $2::jsonb, $3, now())
          returning *
        `,
        [uid, JSON.stringify(item), cartTag]
      )

      await client.query('commit')
      didBegin = false
      return inserted.rows[0]
    } catch (e) {
      if (didBegin) {
        try { await client.query('rollback') } catch (_) {}
      }
      throw e
    } finally {
      await client.end()
    }
  }

  async remove(uid: string, tag: string) {
    const dbUrl = this.cfg.get('SUPABASE_DB_URL')
    if (!dbUrl) throw new InternalServerErrorException('SUPABASE_DB_URL не настроен')
    const client = await this.makePgClient(dbUrl)
    await client.connect()

    let didBegin = false
    try {
      await client.query('begin')
      didBegin = true

      const stockCol = await this.resolveStockColumn(client)
      const tagType = await this.resolveTagType(client)

      const existing = await client.query(
        `select data from public.cart_items where user_id = $1 and tag = $2 for update`,
        [uid, tag]
      )

      if (existing.rowCount === 0) {
        await client.query('commit')
        didBegin = false
        return { ok: true }
      }

      const data = (existing.rows[0] as any)?.data ?? {}
      const productTag = this.normalizeTag((data as any)?.product_tag)
      const meters = Number((data as any)?.meters ?? 0)
      const quantity = Number((data as any)?.quantity ?? 0)
      const inc = Number.isFinite(meters) && meters > 0 ? meters : quantity

      await client.query(`delete from public.cart_items where user_id = $1 and tag = $2`, [uid, tag])

      if (productTag && Number.isFinite(inc) && inc > 0) {
        const tagWhere = this.buildTagWhere(tagType, productTag, 1)
        const incParamIndex = tagWhere.nextIndex
        await client.query(
          `update public.products set ${stockCol} = ${stockCol} + $${incParamIndex} where ${tagWhere.condition}`,
          [...tagWhere.params, inc]
        )
      }

      await client.query('commit')
      didBegin = false
      return { ok: true }
    } catch (e) {
      if (didBegin) {
        try { await client.query('rollback') } catch (_) {}
      }
      throw e
    } finally {
      await client.end()
    }
  }

  async clear(uid: string) {
    const dbUrl = this.cfg.get('SUPABASE_DB_URL')
    if (!dbUrl) throw new InternalServerErrorException('SUPABASE_DB_URL не настроен')
    const client = await this.makePgClient(dbUrl)
    await client.connect()

    let didBegin = false
    try {
      await client.query('begin')
      didBegin = true

      const stockCol = await this.resolveStockColumn(client)
      const tagType = await this.resolveTagType(client)

      const existing = await client.query(`select data from public.cart_items where user_id = $1 for update`, [uid])
      await client.query(`delete from public.cart_items where user_id = $1`, [uid])

      const totals = new Map<string, number>()
      for (const r of existing.rows || []) {
        const data = (r as any)?.data ?? {}
        const productTag = this.normalizeTag((data as any)?.product_tag)
        if (!productTag) continue
        const meters = Number((data as any)?.meters ?? 0)
        const quantity = Number((data as any)?.quantity ?? 0)
        const inc = Number.isFinite(meters) && meters > 0 ? meters : quantity
        if (!Number.isFinite(inc) || inc <= 0) continue
        totals.set(productTag, (totals.get(productTag) ?? 0) + inc)
      }

      for (const [productTag, inc] of totals.entries()) {
        const tagWhere = this.buildTagWhere(tagType, productTag, 1)
        const incParamIndex = tagWhere.nextIndex
        await client.query(
          `update public.products set ${stockCol} = ${stockCol} + $${incParamIndex} where ${tagWhere.condition}`,
          [...tagWhere.params, inc]
        )
      }

      await client.query('commit')
      didBegin = false
      return { ok: true }
    } catch (e) {
      if (didBegin) {
        try { await client.query('rollback') } catch (_) {}
      }
      throw e
    } finally {
      await client.end()
    }
  }
}
