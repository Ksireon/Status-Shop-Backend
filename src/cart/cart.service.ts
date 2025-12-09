import { Injectable } from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'
import { CartItemDto } from './dto/cart-item.dto'

@Injectable()
export class CartService {
  constructor(private readonly supabase: SupabaseService) {}

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
    const payload = { user_id: uid, data: item, tag: item.tag, created_at: new Date().toISOString() }
    const { data, error } = await this.supabase.admin.from('cart_items').insert(payload).select().single()
    if (error) throw error
    return data
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
