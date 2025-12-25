import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'

@Injectable()
export class SystemService {
  constructor(private readonly supabase: SupabaseService) {}

  async ensureBranchesTable() {
    // сначала проверяем существование
    const { data: exists, error: existsErr } = await this.supabase.admin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'branches')
      .limit(1)
    if (!existsErr && (exists || []).length > 0) {
      return { ok: true }
    }
    // пробуем создать через RPC-функцию ensure_branches (должна быть создана миграцией)
    const created = await this.supabase.admin.rpc('ensure_branches')
    if (!created.error) {
      return { ok: true, via: 'rpc' }
    }
    // если RPC отсутствует или вернула ошибку — сообщаем понятную причину
    throw new InternalServerErrorException('Таблица public.branches отсутствует и RPC ensure_branches не найдена')
  }
}
