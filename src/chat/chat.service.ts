import { Injectable, BadRequestException } from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'
import { ChatGateway } from './chat.gateway'

@Injectable()
export class ChatService {
  constructor(private readonly supabase: SupabaseService, private readonly gateway: ChatGateway) {}

  async listRooms(filters: { status?: string; assigned_role?: 'owner' | 'director' | 'manager'; limit?: number }) {
    let q = this.supabase.admin.from('chat_rooms').select('*')
    if (filters.assigned_role) q = q.eq('assigned_role', filters.assigned_role)
    if (filters.status) q = q.eq('status', filters.status)
    const { data, error } = await q.order('last_message_at', { ascending: false, nullsFirst: false }).limit(filters.limit || 200)
    if (error) throw error
    return data
  }

  async ensureRoom(user_id: string) {
    if (!user_id) throw new BadRequestException('user_id required')
    const { data: existing } = await this.supabase.admin
      .from('chat_rooms')
      .select('id')
      .eq('user_id', user_id)
      .limit(1)
      .maybeSingle()
    if (existing?.id) return existing
    const { data, error } = await this.supabase.admin
      .from('chat_rooms')
      .insert({ user_id, status: 'open', assigned_role: 'manager' })
      .select('id')
      .single()
    if (error) throw error
    return data
  }

  async listMessages(room_id: string, limit = 100) {
    const { data, error } = await this.supabase.admin
      .from('chat_messages')
      .select('*')
      .eq('room_id', room_id)
      .order('created_at', { ascending: true })
      .limit(limit)
    if (error) throw error
    return data
  }

  async sendMessage(room_id: string, payload: { sender_type: 'user' | 'staff', sender_id?: string, content: string }) {
    const { data, error } = await this.supabase.admin
      .from('chat_messages')
      .insert({ room_id, sender_type: payload.sender_type, sender_id: payload.sender_id || null, content: payload.content })
      .select('*')
      .single()
    if (error) throw error
    await this.supabase.admin.from('chat_rooms').update({ last_message_at: new Date().toISOString() }).eq('id', room_id)
    try { this.gateway.emitMessage(room_id, data) } catch {}
    return data
  }

  async assignRoom(id: string, payload: { assigned_role: 'owner' | 'director' | 'manager'; assigned_staff_id?: string | null }) {
    const patch: any = { assigned_role: payload.assigned_role }
    if (payload.assigned_staff_id !== undefined) patch.assigned_staff_id = payload.assigned_staff_id
    const { data, error } = await this.supabase.admin
      .from('chat_rooms')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw error
    return data
  }

  async closeRoom(id: string) {
    const { data, error } = await this.supabase.admin
      .from('chat_rooms')
      .update({ status: 'closed', closed_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw error
    return data
  }
}
