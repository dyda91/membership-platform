import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { AccountStatus, Role } from '@prisma/client';
import { JwtStrategy } from './jwt.strategy';
import { PrismaService } from '../prisma/prisma.service';

const makeUser = (overrides: Record<string, unknown> = {}) => ({
  id: 'uuid-1',
  email: 'user@test.com',
  passwordHash: '$2b$10$hash',
  name: null,
  status: AccountStatus.ACTIVE,
  tierId: null,
  tier: null,
  roles: [{ role: Role.SUBSCRIBER }],
  ...overrides,
});

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let prisma: { user: { findUnique: jest.Mock } };

  beforeEach(async () => {
    prisma = {
      user: { findUnique: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: ConfigService, useValue: { getOrThrow: () => 'secret' } },
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('resolves the current account from the database', async () => {
    prisma.user.findUnique.mockResolvedValue(makeUser());

    const result = await strategy.validate({
      sub: 'uuid-1',
      email: 'u@t.com',
      roles: [],
    });

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'uuid-1' },
      include: { roles: true, tier: true },
    });
    expect(result.roles).toEqual([Role.SUBSCRIBER]);
  });

  it('uses database roles even when JWT claims contain different roles', async () => {
    prisma.user.findUnique.mockResolvedValue(
      makeUser({ roles: [{ role: Role.ARTIST }] }),
    );

    const result = await strategy.validate({
      sub: 'uuid-1',
      email: 'u@t.com',
      roles: ['SUBSCRIBER'],
    });

    expect(result.roles).toEqual([Role.ARTIST]);
  });

  it('rejects tokens whose account no longer exists', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(
      strategy.validate({ sub: 'missing', email: 'x@t.com', roles: [] }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('rejects inactive or blocked accounts', async () => {
    prisma.user.findUnique.mockResolvedValue(
      makeUser({ status: AccountStatus.DISABLED }),
    );

    await expect(
      strategy.validate({ sub: 'uuid-1', email: 'u@t.com', roles: [] }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('attaches current tier and tier priority', async () => {
    prisma.user.findUnique.mockResolvedValue(
      makeUser({
        tierId: 'tier-1',
        tier: { id: 'tier-1', name: 'Gold', priority: 5 },
      }),
    );

    const result = await strategy.validate({
      sub: 'uuid-1',
      email: 'u@t.com',
      roles: [],
    });

    expect(result.tierPriority).toBe(5);
    expect(result.tierId).toBe('tier-1');
  });
});
