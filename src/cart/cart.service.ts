import { BadRequestException, ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common'
import { Client } from 'pg'
import { ConfigService } from '../config/config.service'
import { SupabaseService } from '../supabase/supabase.service'
import { CartItemDto } from './dto/cart-item.dto'

@Injectable()
export class CartService {
  constructor(private readonly supabase: SupabaseService, private readonly cfg: ConfigService) {}

  private isMissingRpc(err: any) {
    const code = String(err?.code || '')
    const msg = String(err?.message || '')
    return code === 'PGRST202' || msg.toLowerCase().includes('could not find the function') || msg.toLowerCase().includes('function') && msg.toLowerCase().includes('does not exist')
  }

  private isRpcAuthMismatch(err: any) {
    const code = String(err?.code || '')
    const msg = String(err?.message || '').toLowerCase()
    return code === '28000' || code === '42501' || msg.includes('unauthorized') || msg.includes('forbidden')
  }

  private isTagTypeMismatch(err: any) {
    const msg = String(err?.message || '').toLowerCase()
    return msg.includes('operator does not exist') || msg.includes('invalid input syntax') || msg.includes('cannot cast')
  }

  private async getStockByTagSupabase(productTag: string) {
    const tag = String(productTag || '').trim()
    if (!tag) throw new InternalServerErrorException('Ошибка получения товара')

    const admin: any = this.supabase.admin as any
    const tagExprs = ['tag', 'tag->>en', 'tag->>ru', 'tag->>uz']
    let lastErr: any = null
    for (const expr of tagExprs) {
      const res = await admin.from('products').select('amount').eq(expr, tag).limit(1).maybeSingle()
      if (res.error) {
        lastErr = res.error
        if (this.isTagTypeMismatch(res.error)) continue
        const msg = String((res.error as any)?.message || '')
        throw new InternalServerErrorException(msg || 'Ошибка получения товара')
      }
      return { currentRaw: (res.data as any)?.amount }
    }

    const msg = String((lastErr as any)?.message || '')
    throw new InternalServerErrorException(msg || 'Ошибка получения товара')
  }

  private async decrementStockPg(ref: { productId?: string, productTag?: string }, dec: number) {
    const dbUrl = this.cfg.get('SUPABASE_DB_URL')
    if (!dbUrl) return null
    const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } })
    await client.connect()
    try {
      if (ref.productId) {
        const res = await client.query(
          `update public.products set amount = amount - $1 where id = $2 and amount >= $1 returning amount;`,
          [dec, ref.productId],
        )
        if (res.rows.length === 0) throw new ConflictException('Недостаточно товара на складе')
        return { nextAmount: res.rows[0].amount }
      }

      const tag = String(ref.productTag || '').trim()
      if (!tag) return null
      const col = await client.query(
        `select data_type from information_schema.columns where table_schema='public' and table_name='products' and column_name='tag' limit 1;`,
      )
      const dataType = String(col.rows?.[0]?.data_type || '').toLowerCase()
      if (dataType === 'json' || dataType === 'jsonb') {
        const jsonString = JSON.stringify(tag)
        const res = await client.query(
          `update public.products
           set amount = amount - $1
           where (tag->>'en' = $2 or tag->>'ru' = $2 or tag->>'uz' = $2 or tag::text = $3)
             and amount >= $1
           returning amount;`,
          [dec, tag, jsonString],
        )
        if (res.rows.length === 0) throw new ConflictException('Недостаточно товара на складе')
        return { nextAmount: res.rows[0].amount }
      }

      const res = await client.query(
        `update public.products set amount = amount - $1 where tag = $2 and amount >= $1 returning amount;`,
        [dec, tag],
      )
      if (res.rows.length === 0) throw new ConflictException('Недостаточно товара на складе')
      return { nextAmount: res.rows[0].amount }
    } finally {
      await client.end()
    }
  }

  private async incrementStockPg(ref: { productId?: string, productTag?: string }, inc: number) {
    const dbUrl = this.cfg.get('SUPABASE_DB_URL')
    if (!dbUrl) return null
    const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } })
    await client.connect()
    try {
      if (ref.productId) {
        await client.query(`update public.products set amount = amount + $1 where id = $2;`, [inc, ref.productId])
        return { ok: true }
      }

      const tag = String(ref.productTag || '').trim()
      if (!tag) return null
      const col = await client.query(
        `select data_type from information_schema.columns where table_schema='public' and table_name='products' and column_name='tag' limit 1;`,
      )
      const dataType = String(col.rows?.[0]?.data_type || '').toLowerCase()
      if (dataType === 'json' || dataType === 'jsonb') {
        const jsonString = JSON.stringify(tag)
        await client.query(
          `update public.products
           set amount = amount + $1
           where (tag->>'en' = $2 or tag->>'ru' = $2 or tag->>'uz' = $2 or tag::text = $3);`,
          [inc, tag, jsonString],
        )
        return { ok: true }
      }

      await client.query(`update public.products set amount = amount + $1 where tag = $2;`, [inc, tag])
      return { ok: true }
    } finally {
      await client.end()
    }
  }

  private async getStock(ref: { productId?: string, productTag?: string }) {
    const q = this.supabase.admin.from('products').select('amount')
    if (ref.productId) {
      const res = await q.eq('id', ref.productId).single()
      if (res.error) {
        const msg = String((res.error as any)?.message || '')
        throw new InternalServerErrorException(msg || 'Ошибка получения товара')
      }
      return { currentRaw: (res.data as any)?.amount }
    }

    return this.getStockByTagSupabase(String(ref.productTag || ''))
  }

  private async decrementStock(ref: { productId?: string, productTag?: string }, dec: number) {
    const viaPg = await this.decrementStockPg(ref, dec)
    if (viaPg) return viaPg
    for (let attempt = 0; attempt < 5; attempt++) {
      const { currentRaw } = await this.getStock(ref)
      const current = Number(currentRaw ?? 0)
      if (!Number.isFinite(current)) throw new InternalServerErrorException('Некорректный остаток товара')
      if (current < dec) throw new ConflictException('Недостаточно товара на складе')

      const next = current - dec
      const updBase: any = (this.supabase.admin as any)
        .from('products')
        .update({ amount: next })
        .eq('amount', currentRaw)
        .select('amount')

      let updated: any
      let updErr: any = null
      if (ref.productId) {
        const res = await updBase.eq('id', ref.productId)
        updated = res.data
        updErr = res.error
      } else {
        const tag = String(ref.productTag || '').trim()
        const tagExprs = ['tag', 'tag->>en', 'tag->>ru', 'tag->>uz']
        for (const expr of tagExprs) {
          const res = await updBase.eq(expr, tag)
          if (res.error) {
            updErr = res.error
            if (this.isTagTypeMismatch(res.error)) continue
            break
          }
          updated = res.data
          updErr = null
          break
        }
      }

      if (updErr) {
        const msg = String((updErr as any)?.message || '')
        throw new InternalServerErrorException(msg || 'Ошибка обновления остатка')
      }

      if (updated && updated.length > 0) {
        return { previousAmount: currentRaw, nextAmount: next }
      }
    }

    throw new ConflictException('Не удалось обновить остаток. Попробуйте снова.')
  }

  private async incrementStock(ref: { productId?: string, productTag?: string }, inc: number) {
    if ((!ref.productId && !ref.productTag) || !Number.isFinite(inc) || inc <= 0) return
    const viaPg = await this.incrementStockPg(ref, inc)
    if (viaPg) return
    for (let attempt = 0; attempt < 5; attempt++) {
      let stock: { currentRaw: any } | null = null
      try {
        stock = await this.getStock(ref)
      } catch (_) {
        return
      }

      const { currentRaw } = stock
      const current = Number(currentRaw ?? 0)
      if (!Number.isFinite(current)) return
      const next = current + inc

      const updBase: any = (this.supabase.admin as any)
        .from('products')
        .update({ amount: next })
        .eq('amount', currentRaw)
        .select('amount')

      let updated: any
      let updErr: any = null
      if (ref.productId) {
        const res = await updBase.eq('id', ref.productId)
        updated = res.data
        updErr = res.error
      } else {
        const tag = String(ref.productTag || '').trim()
        const tagExprs = ['tag', 'tag->>en', 'tag->>ru', 'tag->>uz']
        for (const expr of tagExprs) {
          const res = await updBase.eq(expr, tag)
          if (res.error) {
            updErr = res.error
            if (this.isTagTypeMismatch(res.error)) continue
            break
          }
          updated = res.data
          updErr = null
          break
        }
      }

      if (updErr) return
      if (updated && updated.length > 0) return
    }
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
    const productId = String((item as any)?.product_id || '').trim()
    const productTag = String((item as any)?.product_tag || '').trim()
    if (!productId && !productTag) throw new BadRequestException('product_id or product_tag is required')
    const dec = Number((item as any)?.amount ?? (item as any)?.quantity ?? 0)
    if (!Number.isFinite(dec) || dec <= 0) throw new BadRequestException('amount must be > 0')
    const cartTag = String((item as any)?.tag || '').trim()
    if (!cartTag) throw new BadRequestException('tag is required')

    const normalized = {
      name: (item as any)?.name,
      description: (item as any)?.description,
      type: (item as any)?.type,
      image: String((item as any)?.image ?? ''),
      color: String((item as any)?.color ?? ''),
      price: Number((item as any)?.price ?? 0),
      amount: dec,
      product_id: productId || undefined,
      product_tag: productTag || undefined,
      characteristic: (item as any)?.characteristic,
      total: Number((item as any)?.total ?? 0),
      tag: cartTag,
      createdAt: (item as any)?.createdAt,
    }

    const { data, error } = await this.supabase.admin.rpc('cart_add_item', {
      p_user_id: uid,
      p_item: normalized as any,
      p_tag: cartTag,
    })

    if (error) {
      if (this.isMissingRpc(error) || this.isRpcAuthMismatch(error)) {
        await this.decrementStock({ productId: productId || undefined, productTag: productTag || undefined }, dec)
        const { data: inserted, error: insErr } = await this.supabase.admin
          .from('cart_items')
          .insert({ user_id: uid, data: normalized as any, tag: cartTag })
          .select()
          .single()

        if (insErr) {
          await this.incrementStock({ productId: productId || undefined, productTag: productTag || undefined }, dec)
          const msg = String((insErr as any)?.message || '')
          throw new InternalServerErrorException(msg || 'Ошибка добавления в корзину')
        }

        return inserted
      }

      const code = (error as any)?.code as string | undefined
      const msg = String((error as any)?.message || '')
      if (code === '23514' || msg.includes('Недостаточно')) throw new ConflictException('Недостаточно товара на складе')
      if (code === '22023') throw new BadRequestException(msg || 'Bad request')
      throw new InternalServerErrorException(msg || 'Ошибка добавления в корзину')
    }

    return data
  }

  async remove(uid: string, tag: string) {
    const { data, error } = await this.supabase.admin.rpc('cart_remove_item', {
      p_user_id: uid,
      p_tag: tag,
    })

    if (error) {
      if (this.isMissingRpc(error) || this.isRpcAuthMismatch(error)) {
        const { data: existing, error: exErr } = await this.supabase.admin
          .from('cart_items')
          .select('data')
          .eq('user_id', uid)
          .eq('tag', tag)
          .single()

        if (exErr || !existing) return { ok: true }

        const payload = (existing as any)?.data ?? {}
        const productId = String(payload?.product_id || '').trim()
        const productTag = String(payload?.product_tag || '').trim()
        const inc = Number(payload?.amount ?? payload?.quantity ?? 0)

        const { error: delErr } = await this.supabase.admin
          .from('cart_items')
          .delete()
          .eq('user_id', uid)
          .eq('tag', tag)

        if (delErr) {
          const msg = String((delErr as any)?.message || '')
          throw new InternalServerErrorException(msg || 'Ошибка удаления из корзины')
        }

        await this.incrementStock({ productId: productId || undefined, productTag: productTag || undefined }, inc)
        return { ok: true }
      }

      const msg = String((error as any)?.message || '')
      throw new InternalServerErrorException(msg || 'Ошибка удаления из корзины')
    }

    return data ?? { ok: true }
  }

  async clear(uid: string) {
    const { data, error } = await this.supabase.admin.rpc('cart_clear', { p_user_id: uid })
    if (error) {
      if (this.isMissingRpc(error) || this.isRpcAuthMismatch(error)) {
        const { data: rows, error: selErr } = await this.supabase.admin
          .from('cart_items')
          .select('data')
          .eq('user_id', uid)
          .limit(1000)

        if (selErr) {
          const msg = String((selErr as any)?.message || '')
          throw new InternalServerErrorException(msg || 'Ошибка очистки корзины')
        }

        const totals = new Map<string, { ref: { productId?: string, productTag?: string }, inc: number }>()
        for (const r of rows || []) {
          const payload = (r as any)?.data ?? {}
          const productId = String(payload?.product_id || '').trim()
          const productTag = String(payload?.product_tag || '').trim()
          if (!productId && !productTag) continue
          const inc = Number(payload?.amount ?? payload?.quantity ?? 0)
          if (!Number.isFinite(inc) || inc <= 0) continue
          const key = productId ? `id:${productId}` : `tag:${productTag}`
          const prev = totals.get(key)
          totals.set(key, {
            ref: { productId: productId || undefined, productTag: productTag || undefined },
            inc: (prev?.inc ?? 0) + inc,
          })
        }

        const { error: delErr } = await this.supabase.admin.from('cart_items').delete().eq('user_id', uid)
        if (delErr) {
          const msg = String((delErr as any)?.message || '')
          throw new InternalServerErrorException(msg || 'Ошибка очистки корзины')
        }

        for (const { ref, inc } of totals.values()) {
          await this.incrementStock(ref, inc)
        }

        return { ok: true }
      }

      const msg = String((error as any)?.message || '')
      throw new InternalServerErrorException(msg || 'Ошибка очистки корзины')
    }
    return data ?? { ok: true }
  }
}
