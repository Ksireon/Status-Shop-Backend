import { BadRequestException, ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common'
import { Client } from 'pg'
import { SupabaseService } from '../supabase/supabase.service'
import { CartItemDto } from './dto/cart-item.dto'
import { ConfigService } from '../config/config.service'

@Injectable()
export class CartService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly cfg: ConfigService,
  ) {}

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

    const dbUrl = this.cfg.get('SUPABASE_DB_URL')
    if (!dbUrl) throw new InternalServerErrorException('SUPABASE_DB_URL не настроен')

    const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } })
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

      const newAmount = Number((updated.rows[0] as any)?.amount ?? 0)
      if (Number.isFinite(newAmount) && newAmount <= 0) {
        await client.query(`delete from public.products where tag = $1`, [productTag])
      }

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
    const { error } = await this.supabase.admin.from('cart_items').delete().eq('user_id', uid).eq('tag', tag)
    if (error) throw error
    return { ok: true }
  }

  async clear(uid: string) {
    const { error } = await this.supabase.admin.from('cart_items').delete().eq('user_id', uid)
    if (error) throw error
    return { ok: true }
  }
}
