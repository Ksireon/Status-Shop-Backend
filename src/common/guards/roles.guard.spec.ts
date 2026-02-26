import { ForbiddenException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { UserRole } from '../constants/user-role';
import type { JwtPayload } from '../types/jwt-payload';

function createContext(user: JwtPayload | undefined): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
    // The guard only relies on handler/class metadata; we stub them with empty functions.
    getHandler: () => ({} as unknown as Function),
    getClass: () => ({} as unknown as Function),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  let reflector: jest.Mocked<Reflector>;
  let guard: RolesGuard;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;
    guard = new RolesGuard(reflector);
  });

  it('allows when no roles are required', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const context = createContext({
      sub: '1',
      email: 'user@example.com',
      role: UserRole.USER,
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('denies when user is missing', () => {
    reflector.getAllAndOverride.mockReturnValue([UserRole.USER]);
    const context = createContext(undefined);

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('enforces minimal rank for single role', () => {
    reflector.getAllAndOverride.mockReturnValue([UserRole.MANAGER]);

    const user = {
      sub: '1',
      email: 'user@example.com',
      role: UserRole.USER,
    } satisfies JwtPayload;
    const manager = { ...user, role: UserRole.MANAGER } as const;
    const owner = { ...user, role: UserRole.OWNER } as const;

    expect(() => guard.canActivate(createContext(user))).toThrow(
      ForbiddenException,
    );
    expect(guard.canActivate(createContext(manager))).toBe(true);
    expect(guard.canActivate(createContext(owner))).toBe(true);
  });

  it('treats BRANCH_DIRECTOR as higher rank than MANAGER', () => {
    reflector.getAllAndOverride.mockReturnValue([UserRole.BRANCH_DIRECTOR]);

    const base = {
      sub: '1',
      email: 'user@example.com',
      role: UserRole.USER,
    } satisfies JwtPayload;

    const manager = { ...base, role: UserRole.MANAGER } as const;
    const director = { ...base, role: UserRole.BRANCH_DIRECTOR } as const;
    const owner = { ...base, role: UserRole.OWNER } as const;

    expect(() => guard.canActivate(createContext(manager))).toThrow(
      ForbiddenException,
    );
    expect(guard.canActivate(createContext(director))).toBe(true);
    expect(guard.canActivate(createContext(owner))).toBe(true);
  });

  it('allows ADMIN wherever OWNER is allowed', () => {
    reflector.getAllAndOverride.mockReturnValue([UserRole.OWNER]);

    const admin: JwtPayload = {
      sub: '1',
      email: 'admin@example.com',
      role: UserRole.ADMIN,
    };

    expect(guard.canActivate(createContext(admin))).toBe(true);
  });
}

