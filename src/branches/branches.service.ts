import { Injectable, NotFoundException } from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'
import { CreateBranchDto } from './dto/create-branch.dto'
import { UpdateBranchDto } from './dto/update-branch.dto'

@Injectable()
export class BranchesService {
  constructor(private readonly supabase: SupabaseService) {}

  async list(opts: { page: number, limit: number }) {
    const from = (opts.page - 1) * opts.limit
    const to = from + opts.limit - 1
    const { data, error } = await this.supabase.admin
      .from('branches')
      .select('*')
      .order('created_at', { ascending: true })
      .range(from, to)
    if (error) throw error
    return data
  }

  async get(id: string) {
    const { data, error } = await this.supabase.admin.from('branches').select('*').eq('id', id).single()
    if (error || !data) throw new NotFoundException()
    return data
  }

  async create(dto: CreateBranchDto) {
    const payload = { ...dto, created_at: new Date().toISOString() }
    const { data, error } = await this.supabase.admin.from('branches').insert(payload).select().single()
    if (error || !data) throw error || new NotFoundException()
    return data
  }

  async update(id: string, dto: UpdateBranchDto) {
    const { data, error } = await this.supabase.admin.from('branches').update(dto).eq('id', id).select().single()
    if (error || !data) throw new NotFoundException()
    return data
  }

  async remove(id: string) {
    const { error } = await this.supabase.admin.from('branches').delete().eq('id', id)
    if (error) throw error
    return { ok: true }
  }
}
