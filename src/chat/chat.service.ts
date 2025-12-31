import { Injectable, BadRequestException } from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'
import { ChatGateway } from './chat.gateway'

@Injectable()
export class ChatService {
  constructor(private readonly supabase: SupabaseService, private readonly gateway: ChatGateway) {}

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

  async assignRole(room_id: string, role: 'owner' | 'director' | 'manager' | null) {
    const patch: any = {}
    if (role === null) {
      patch.assigned_role = null
    } else {
      if (!['owner', 'director', 'manager'].includes(role)) throw new BadRequestException('invalid role')
      patch.assigned_role = role
    }
    const { data, error } = await this.supabase.admin
      .from('chat_rooms')
      .update(patch)
      .eq('id', room_id)
      .select('*')
      .single()
    if (error || !data) throw new BadRequestException('update failed')
    return data
  }
}
