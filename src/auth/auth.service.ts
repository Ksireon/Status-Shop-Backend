import { Injectable, UnauthorizedException } from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'

@Injectable()
export class AuthService {
  constructor(private readonly supabase: SupabaseService) {}

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase()
    const { data: created, error } = await this.supabase.admin.auth.admin.createUser({
      email,
      password: dto.password,
      email_confirm: true,
      user_metadata: {
        name: dto.name,
        surname: dto.surname,
        company: dto.company,
        position: dto.position,
        city: dto.city,
        phone: dto.phone
      }
    })
    if (error || !created.user) throw new UnauthorizedException('Cannot create user')
    const profile = {
      id: created.user.id,
      email,
      name: dto.name,
      surname: dto.surname,
      company: dto.company ?? null,
      position: dto.position ?? null,
      city: dto.city ?? null,
      phone: dto.phone ?? null
    }
    const { error: upsertErr } = await this.supabase.admin.from('profiles').upsert(profile)
    if (upsertErr) throw new UnauthorizedException('Cannot create profile')
    return { uid: created.user.id, profile }
  }

  async login(dto: LoginDto) {
    const { data, error } = await this.supabase.admin.auth.signInWithPassword({ email: dto.email.toLowerCase(), password: dto.password })
    if (error || !data.session) throw new UnauthorizedException('Invalid credentials')
    const token = data.session.access_token
    const refresh_token = data.session.refresh_token
    const { data: profile } = await this.supabase.admin
      .from('profiles')
      .select('*')
      .eq('id', data.user?.id ?? '')
      .single()
    return { token, refresh_token, uid: data.user?.id, profile }
  }

  async me(token: string) {
    const { data, error } = await this.supabase.anon.auth.getUser(token)
    if (error || !data.user) throw new UnauthorizedException()
    const { data: profile } = await this.supabase.admin.from('profiles').select('*').eq('id', data.user.id).single()
    return { uid: data.user.id, email: data.user.email, profile }
  }
 
  async refresh(refreshToken: string) {
    const { data, error } = await this.supabase.anon.auth.refreshSession({ refresh_token: refreshToken })
    if (error || !data.session) throw new UnauthorizedException('Invalid refresh token')
    const token = data.session.access_token
    const refresh_token = data.session.refresh_token
    const uid = data.session.user?.id ?? ''
    const { data: profile } = await this.supabase.admin.from('profiles').select('*').eq('id', uid).single()
    return { token, refresh_token, uid, profile }
  }
}
