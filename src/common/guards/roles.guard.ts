import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import type { UserRole } from '../constants/user-role';
import type { JwtPayload } from '../types/jwt-payload';

const ROLE_RANK: Record<UserRole, number> = {
  USER: 0,
  MANAGER: 10,
  BRANCH_DIRECTOR: 20,
  OWNER: 30,
  ADMIN: 30,
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const required = this.reflector.getAllAndOverride<UserRole[] | undefined>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!required?.length) return true;

    const req = context.switchToHttp().getRequest<{ user?: JwtPayload }>();
    const user = req.user;
    if (!user) throw new ForbiddenException();

    const userRank = ROLE_RANK[user.role] ?? 0;
    const minRequiredRank = Math.min(...required.map((r) => ROLE_RANK[r] ?? 0));

    if (userRank < minRequiredRank) throw new ForbiddenException();
    return true;
  }
}
