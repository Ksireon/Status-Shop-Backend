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

  private extractProductTag(item: any): string {
    const v =
      item?.product_tag ??
      item?.productTag ??
      item?.product ??
      item?.productTagId
    return String(v || '').trim()
  }

  private extractCartTag(item: any): string {
    return String(item?.tag || '').trim()
  }

  private extractDecrement(item: any): number {
    const meters = Number(item?.meters ?? 0)
    if (Number.isFinite(meters) && meters > 0) return meters
    return Number(item?.quantity ?? 0)
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
    const productTag = this.extractProductTag(item as any)
    if (!productTag) throw new BadRequestException('product_tag is required')
    const dec = this.extractDecrement(item as any)
    if (!Number.isFinite(dec) || dec <= 0) throw new BadRequestException('quantity must be > 0')

    const dbUrl = this.cfg.get('SUPABASE_DB_URL')
    if (!dbUrl) {
      return this.addViaSupabase(uid, item, productTag, dec)
    }

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

  private async addViaSupabase(uid: string, item: CartItemDto, productTag: string, dec: number) {
    const cartTag = this.extractCartTag(item as any)
    if (!cartTag) throw new BadRequestException('tag is required')

    const maxAttempts = 4
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const { data: product, error: productError } = await this.supabase.admin
        .from('products')
        .select('amount')
        .eq('tag', productTag)
        .single()

      if (productError || !product) {
        throw new BadRequestException('Товар не найден')
      }

      const amountRaw = (product as any).amount
      const currentAmount = Number(amountRaw ?? 0)
      if (!Number.isFinite(currentAmount)) {
        throw new InternalServerErrorException('Некорректное значение amount')
      }
      if (currentAmount < dec) {
        throw new ConflictException('Недостаточно товара на складе')
      }

      const nextAmount = currentAmount - dec
      const { data: updatedRows, error: updateError } = await this.supabase.admin
        .from('products')
        .update({ amount: nextAmount })
        .eq('tag', productTag)
        .eq('amount', amountRaw)
        .select('amount')

      if (updateError) throw updateError
      if (!updatedRows || updatedRows.length === 0) continue

      const { data: inserted, error: insertError } = await this.supabase.admin
        .from('cart_items')
        .insert({
          user_id: uid,
          data: item as any,
          tag: cartTag,
          created_at: new Date().toISOString(),
        })
        .select('*')
        .single()

      if (insertError || !inserted) {
        await this.supabase.admin
          .from('products')
          .update({ amount: currentAmount })
          .eq('tag', productTag)
          .eq('amount', nextAmount)
        throw insertError ?? new InternalServerErrorException('Не удалось добавить в корзину')
      }

      if (Number.isFinite(nextAmount) && nextAmount <= 0) {
        await this.supabase.admin.from('products').delete().eq('tag', productTag)
      }

      return inserted
    }

    throw new ConflictException('Не удалось зарезервировать товар, попробуйте еще раз')
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
