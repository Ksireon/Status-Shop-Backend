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

  private async decrementStock(productTag: string, dec: number) {
    for (let attempt = 0; attempt < 5; attempt++) {
      const { data: prod, error: prodErr } = await this.supabase.admin
        .from('products')
        .select('amount')
        .eq('tag', productTag)
        .single()

      if (prodErr) {
        const msg = String((prodErr as any)?.message || '')
        throw new InternalServerErrorException(msg || 'Ошибка получения товара')
      }

      const currentRaw = (prod as any)?.amount
      const current = Number(currentRaw ?? 0)
      if (!Number.isFinite(current)) throw new InternalServerErrorException('Некорректный остаток товара')
      if (current < dec) throw new ConflictException('Недостаточно товара на складе')

      const next = current - dec
      const { data: updated, error: updErr } = await this.supabase.admin
        .from('products')
        .update({ amount: next })
        .eq('tag', productTag)
        .eq('amount', currentRaw)
        .select('amount')

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

  private async incrementStock(productTag: string, inc: number) {
    if (!productTag || !Number.isFinite(inc) || inc <= 0) return
    for (let attempt = 0; attempt < 5; attempt++) {
      const { data: prod, error: prodErr } = await this.supabase.admin
        .from('products')
        .select('amount')
        .eq('tag', productTag)
        .single()

      if (prodErr) return

      const currentRaw = (prod as any)?.amount
      const current = Number(currentRaw ?? 0)
      if (!Number.isFinite(current)) return
      const next = current + inc

      const { data: updated, error: updErr } = await this.supabase.admin
        .from('products')
        .update({ amount: next })
        .eq('tag', productTag)
        .eq('amount', currentRaw)
        .select('amount')

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
    const productTag = String((item as any)?.product_tag || '').trim()
    if (!productTag) throw new BadRequestException('product_tag is required')
    const meters = Number((item as any)?.meters ?? 0)
    const quantity = Number((item as any)?.quantity ?? 0)
    const dec = Number.isFinite(meters) && meters > 0 ? meters : quantity
    if (!Number.isFinite(dec) || dec <= 0) throw new BadRequestException('quantity must be > 0')
    const cartTag = String((item as any)?.tag || '').trim()
    if (!cartTag) throw new BadRequestException('tag is required')

    const { data, error } = await this.supabase.admin.rpc('cart_add_item', {
      p_user_id: uid,
      p_item: item as any,
      p_tag: cartTag,
    })

    if (error) {
      if (this.isMissingRpc(error)) {
        const stock = await this.decrementStock(productTag, dec)
        const { data: inserted, error: insErr } = await this.supabase.admin
          .from('cart_items')
          .insert({ user_id: uid, data: item as any, tag: cartTag })
          .select()
          .single()

        if (insErr) {
          await this.incrementStock(productTag, dec)
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
        const productTag = String(payload?.product_tag || '').trim()
        const meters = Number(payload?.meters ?? 0)
        const quantity = Number(payload?.quantity ?? 0)
        const inc = Number.isFinite(meters) && meters > 0 ? meters : quantity

        const { error: delErr } = await this.supabase.admin
          .from('cart_items')
          .delete()
          .eq('user_id', uid)
          .eq('tag', tag)

        if (delErr) {
          const msg = String((delErr as any)?.message || '')
          throw new InternalServerErrorException(msg || 'Ошибка удаления из корзины')
        }

        await this.incrementStock(productTag, inc)
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

        const totals = new Map<string, number>()
        for (const r of rows || []) {
          const payload = (r as any)?.data ?? {}
          const productTag = String(payload?.product_tag || '').trim()
          if (!productTag) continue
          const meters = Number(payload?.meters ?? 0)
          const quantity = Number(payload?.quantity ?? 0)
          const inc = Number.isFinite(meters) && meters > 0 ? meters : quantity
          if (!Number.isFinite(inc) || inc <= 0) continue
          totals.set(productTag, (totals.get(productTag) ?? 0) + inc)
        }

        const { error: delErr } = await this.supabase.admin.from('cart_items').delete().eq('user_id', uid)
        if (delErr) {
          const msg = String((delErr as any)?.message || '')
          throw new InternalServerErrorException(msg || 'Ошибка очистки корзины')
        }

        for (const [productTag, inc] of totals.entries()) {
          await this.incrementStock(productTag, inc)
        }

        return { ok: true }
      }

      const msg = String((error as any)?.message || '')
      throw new InternalServerErrorException(msg || 'Ошибка очистки корзины')
    }
    return data ?? { ok: true }
  }
}
