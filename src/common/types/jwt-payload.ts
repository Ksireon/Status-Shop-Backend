import type { UserRole } from '../constants/user-role';

export type JwtPayload = {
  sub: string;
  email: string;
  role: UserRole;
  shopId?: string | null;
};
