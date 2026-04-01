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

    const user: JwtPayload = {
      sub: '1',
      email: 'user@example.com',
      role: UserRole.USER,
    };
    const manager: JwtPayload = { ...user, role: UserRole.MANAGER };
    const owner: JwtPayload = { ...user, role: UserRole.OWNER };

    expect(() => guard.canActivate(createContext(user))).toThrow(
      ForbiddenException,
    );
    expect(guard.canActivate(createContext(manager))).toBe(true);
    expect(guard.canActivate(createContext(owner))).toBe(true);
  });

  it('treats BRANCH_DIRECTOR as higher rank than MANAGER', () => {
    reflector.getAllAndOverride.mockReturnValue([UserRole.BRANCH_DIRECTOR]);

    const base: JwtPayload = {
      sub: '1',
      email: 'user@example.com',
      role: UserRole.USER,
    };

    const manager: JwtPayload = { ...base, role: UserRole.MANAGER };
    const director: JwtPayload = { ...base, role: UserRole.BRANCH_DIRECTOR };
    const owner: JwtPayload = { ...base, role: UserRole.OWNER };

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
})