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

function getRoleRank(role: UserRole): number {
  const rank = ROLE_RANK[role];
  if (rank === undefined) {
    throw new Error(`Unknown role: ${role as string}`);
  }
  return rank;
}

/**
 * Role-based guard that implements hierarchical access control.
 *
 * Semantics:
 * - Each role has a numeric rank (see ROLE_RANK).
 * - The smallest rank from @Roles() is treated as the minimum required rank.
 * - A user is allowed when userRank >= minRequiredRank.
 *
 * Examples:
 * - @Roles(USER)           -> any authenticated user role passes.
 * - @Roles(MANAGER)        -> MANAGER, BRANCH_DIRECTOR, OWNER, ADMIN pass.
 * - @Roles(BRANCH_DIRECTOR, OWNER)
 *      -> BRANCH_DIRECTOR, OWNER, ADMIN pass (minRequiredRank = BRANCH_DIRECTOR).
 *
 * Prefer specifying a single minimal role in @Roles() for clarity.
 */
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

    const userRank = getRoleRank(user.role);
    const minRequiredRank = Math.min(
      ...required.map((role) => getRoleRank(role)),
    );

    if (userRank < minRequiredRank) throw new ForbiddenException();
    return true;
  }
}
