import { Injectable, NotFoundException } from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'
import { CreateOrderDto } from './dto/create-order.dto'
import { UpdateOrderDto } from './dto/update-order.dto'

function makeShortId() {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

@Injectable()
export class OrdersService {
  constructor(private readonly supabase: SupabaseService) {}

  async listByUser(uid: string, opts: { page: number, limit: number, order: 'asc' | 'desc' }) {
    const from = (opts.page - 1) * opts.limit
    const to = from + opts.limit - 1
    const { data, error } = await this.supabase.admin
      .from('orders')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: opts.order === 'asc' })
      .range(from, to)
    if (error) throw error
    return data
  }

  async get(id: string) {
    const { data, error } = await this.supabase.admin.from('orders').select('*').eq('id', id).single()
    if (error || !data) throw new NotFoundException()
    return data
  }

  async create(dto: CreateOrderDto) {
    const orderId = crypto.randomUUID()
    const shortId = makeShortId()
    const payload = {
      id: orderId,
      short_id: shortId,
      user_id: dto.uid,
      email: dto.email,
      name: dto.name,
      phone: dto.phone,
      branch: dto.branch,
      branch_key: dto.branch_key,
      branch_address: dto.branch_address,
      delivery_type: dto.delivery_type,
      delivery_address: dto.delivery_address ?? null,
      payment_method: dto.payment_method,
      total: dto.total,
      status: 'pending',
      items: dto.items,
      created_at: new Date().toISOString()
    }
    const { data, error } = await this.supabase.admin.from('orders').insert(payload).select().single()
    if (error) throw error
    await this.supabase.admin.from('cart_items').delete().eq('user_id', dto.uid)
    return data
  }

  async update(id: string, dto: UpdateOrderDto) {
    const { data, error } = await this.supabase.admin.from('orders').update({ status: dto.status }).eq('id', id).select().single()
    if (error || !data) throw new NotFoundException()
    return data
  }
}
