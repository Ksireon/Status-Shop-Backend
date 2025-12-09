import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { SupabaseService } from '../../supabase/supabase.service'

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(private readonly supabase: SupabaseService) {}
  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest()
    const auth = req.headers['authorization'] as string | undefined
    if (!auth || !auth.startsWith('Bearer ')) throw new UnauthorizedException()
    const token = auth.slice(7)
    const { data, error } = await this.supabase.anon.auth.getUser(token)
    if (error || !data.user) throw new UnauthorizedException()
    req.user = { id: data.user.id, email: data.user.email }
    return true
  }
}
