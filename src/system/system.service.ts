import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'

@Injectable()
export class SystemService {
  constructor(private readonly supabase: SupabaseService) {}

  async ensureBranchesTable() {
    const { data, error } = await this.supabase.admin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'branches')
      .limit(1)
    if (!error && (data || []).length > 0) {
      return { ok: true }
    }
    throw new InternalServerErrorException('Таблица public.branches отсутствует')
  }
}
