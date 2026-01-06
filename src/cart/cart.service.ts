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
    const productTag = String((item as any)?.product_tag || '').trim()
    if (!productTag) throw new BadRequestException('product_tag is required')
    const meters = Number((item as any)?.meters ?? 0)
    const quantity = Number((item as any)?.quantity ?? 0)
    const dec = Number.isFinite(meters) && meters > 0 ? meters : quantity
    if (!Number.isFinite(dec) || dec <= 0) throw new BadRequestException('quantity must be > 0')

    const rpc = await this.supabase.admin.rpc('cart_add_item', { p_user_id: uid, p_item: item as any })
    if (!rpc.error && rpc.data) return rpc.data
    if (rpc.error) {
      const msg = String((rpc.error as any).message || '')
      if (msg.includes('Недостаточно товара') || msg.toLowerCase().includes('insufficient')) {
        throw new ConflictException('Недостаточно товара на складе')
      }
      const lowered = msg.toLowerCase()
      if (!lowered.includes('could not find the function') && !lowered.includes('function') && !lowered.includes('rpc')) {
        throw new InternalServerErrorException(msg || 'Cart RPC error')
      }
    }

    const dbUrl = this.cfg.get('SUPABASE_DB_URL')
    if (!dbUrl) throw new InternalServerErrorException('Cart RPC не настроен и SUPABASE_DB_URL не задан')

    const client = await this.makePgClient(dbUrl)
    await client.connect()

    let didBegin = false
    try {
      await client.query('begin')
      didBegin = true

      const updated = await client.query(
        `
          update public.products
          set amount = amount - $2
          where tag = $1 and amount >= $2
          returning amount
        `,
        [productTag, dec]
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
        [uid, JSON.stringify(item), item.tag]
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
    const rpc = await this.supabase.admin.rpc('cart_remove_item', { p_user_id: uid, p_tag: tag })
    if (!rpc.error) return { ok: true }

    const dbUrl = this.cfg.get('SUPABASE_DB_URL')
    if (!dbUrl) throw new InternalServerErrorException('Cart RPC не настроен и SUPABASE_DB_URL не задан')
    const client = await this.makePgClient(dbUrl)
    await client.connect()

    let didBegin = false
    try {
      await client.query('begin')
      didBegin = true

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
      const productTag = String((data as any)?.product_tag || '').trim()
      const meters = Number((data as any)?.meters ?? 0)
      const quantity = Number((data as any)?.quantity ?? 0)
      const inc = Number.isFinite(meters) && meters > 0 ? meters : quantity

      await client.query(`delete from public.cart_items where user_id = $1 and tag = $2`, [uid, tag])

      if (productTag && Number.isFinite(inc) && inc > 0) {
        await client.query(
          `update public.products set amount = amount + $2 where tag = $1`,
          [productTag, inc]
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

      const existing = await client.query(`select data from public.cart_items where user_id = $1 for update`, [uid])
      await client.query(`delete from public.cart_items where user_id = $1`, [uid])

      const totals = new Map<string, number>()
      for (const r of existing.rows || []) {
        const data = (r as any)?.data ?? {}
        const productTag = String((data as any)?.product_tag || '').trim()
        if (!productTag) continue
        const meters = Number((data as any)?.meters ?? 0)
        const quantity = Number((data as any)?.quantity ?? 0)
        const inc = Number.isFinite(meters) && meters > 0 ? meters : quantity
        if (!Number.isFinite(inc) || inc <= 0) continue
        totals.set(productTag, (totals.get(productTag) ?? 0) + inc)
      }

      for (const [productTag, inc] of totals.entries()) {
        await client.query(
          `update public.products set amount = amount + $2 where tag = $1`,
          [productTag, inc]
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
