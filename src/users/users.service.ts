import { Injectable, NotFoundException } from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'
import { UpdateUserDto } from './dto/update-user.dto'

@Injectable()
export class UsersService {
  constructor(private readonly supabase: SupabaseService) {}

  async get(uid: string) {
    const { data, error } = await this.supabase.admin.from('users').select('*').eq('id', uid).single()
    if (error || !data) throw new NotFoundException()
    return data
  }

  async update(uid: string, dto: UpdateUserDto) {
    const { data, error } = await this.supabase.admin.from('users').update(dto).eq('id', uid).select().single()
    if (error || !data) throw new NotFoundException()
    return data
  }
}
