import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import type { Request } from 'express';

export type JwtUser = {
  sub: string;
  email: string;
  role: UserRole;
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtUser | undefined => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user?: JwtUser }>();
    return request.user;
  },
);
