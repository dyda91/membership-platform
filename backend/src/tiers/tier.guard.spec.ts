import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { TierGuard } from './tier.guard';
import { REQUIRED_TIER_KEY, RequireTier } from './required-tier.decorator';

const buildContext = (user?: {
  tier: { priority: number } | null;
}): ExecutionContext =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  }) as unknown as ExecutionContext;

describe('TierGuard', () => {
  let guard: TierGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TierGuard, Reflector],
    }).compile();

    guard = module.get<TierGuard>(TierGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should allow access when no tier priority is required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

    expect(guard.canActivate(buildContext({ tier: null }))).toBe(true);
  });

  it('should allow access when the user tier meets the required priority', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(3);

    expect(guard.canActivate(buildContext({ tier: { priority: 3 } }))).toBe(
      true,
    );
  });

  it('should deny access when the user tier is below the required priority', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(3);

    expect(() =>
      guard.canActivate(buildContext({ tier: { priority: 1 } })),
    ).toThrow(ForbiddenException);
  });

  it('should deny access when the user has no tier', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(1);

    expect(() => guard.canActivate(buildContext({ tier: null }))).toThrow(
      ForbiddenException,
    );
  });
});

describe('RequireTier decorator', () => {
  it('should store the required priority as metadata', () => {
    class TestResource {
      @RequireTier(3)
      access(this: void) {}
    }

    const metadata = Reflect.getMetadata(
      REQUIRED_TIER_KEY,
      TestResource.prototype.access,
    ) as number;

    expect(metadata).toBe(3);
  });
});
