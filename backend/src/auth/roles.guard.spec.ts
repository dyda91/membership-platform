import { ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { RolesGuard } from './roles.guard';

const buildContext = (user?: { roles: Role[] }): ExecutionContext =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  }) as unknown as ExecutionContext;

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RolesGuard, Reflector],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should allow access when no roles are required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

    expect(guard.canActivate(buildContext({ roles: [Role.SUBSCRIBER] }))).toBe(
      true,
    );
  });

  it('should allow ADMIN access to an ADMIN-only route', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);

    expect(guard.canActivate(buildContext({ roles: [Role.ADMIN] }))).toBe(true);
  });

  it('should deny SUBSCRIBER access to an ADMIN-only route', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);

    expect(guard.canActivate(buildContext({ roles: [Role.SUBSCRIBER] }))).toBe(
      false,
    );
  });

  it('should deny ARTIST access to an ADMIN-only route', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);

    expect(guard.canActivate(buildContext({ roles: [Role.ARTIST] }))).toBe(
      false,
    );
  });

  it('should allow access when the user holds one of the required roles', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([Role.ADMIN, Role.ARTIST]);

    expect(guard.canActivate(buildContext({ roles: [Role.ARTIST] }))).toBe(
      true,
    );
  });

  it('should deny access when there is no authenticated user', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);

    expect(guard.canActivate(buildContext())).toBe(false);
  });
});
