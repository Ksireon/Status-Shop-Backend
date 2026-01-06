import { BadRequestException, ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'
import { CartItemDto } from './dto/cart-item.dto'

@Injectable()
export class CartService {
  constructor(private readonly supabase: SupabaseService) {}

  private isMissingRpc(err: any) {
    const code = String(err?.code || '')
    const msg = String(err?.message || '')
    return code === 'PGRST202' || msg.toLowerCase().includes('could not find the function') || msg.toLowerCase().includes('function') && msg.toLowerCase().includes('does not exist')
  }

  private async getStock(ref: { productId?: string, productTag?: string }) {
    const q = this.supabase.admin.from('products').select('amount')
    const res = ref.productId
      ? await q.eq('id', ref.productId).single()
      : await q.eq('tag', ref.productTag as any).single()

    if (res.error) {
      const msg = String((res.error as any)?.message || '')
      throw new InternalServerErrorException(msg || 'Ошибка получения товара')
    }

    return { currentRaw: (res.data as any)?.amount }
  }

  private async decrementStock(ref: { productId?: string, productTag?: string }, dec: number) {
    for (let attempt = 0; attempt < 5; attempt++) {
      const { currentRaw } = await this.getStock(ref)
      const current = Number(currentRaw ?? 0)
      if (!Number.isFinite(current)) throw new InternalServerErrorException('Некорректный остаток товара')
      if (current < dec) throw new ConflictException('Недостаточно товара на складе')

      const next = current - dec
      const updBase = this.supabase.admin
        .from('products')
        .update({ amount: next } as any)
        .eq('amount', currentRaw as any)
        .select('amount')

      const { data: updated, error: updErr } = ref.productId
        ? await updBase.eq('id', ref.productId)
        : await updBase.eq('tag', ref.productTag as any)

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

      const updBase = this.supabase.admin
        .from('products')
        .update({ amount: next } as any)
        .eq('amount', currentRaw as any)
        .select('amount')

      const { data: updated, error: updErr } = ref.productId
        ? await updBase.eq('id', ref.productId)
        : await updBase.eq('tag', ref.productTag as any)

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
      if (this.isMissingRpc(error)) {
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
      if (this.isMissingRpc(error)) {
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
      if (this.isMissingRpc(error)) {
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
