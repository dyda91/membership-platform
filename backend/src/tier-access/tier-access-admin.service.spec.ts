import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { AccountStatus, Role } from '@prisma/client';
import { TierAccessAdminService } from './tier-access-admin.service';
import { PrismaService } from '../prisma/prisma.service';

const adminActor = { id: 'super-1', roles: [Role.SUPER_ADMIN] };
const artistActor = { id: 'artist-1', roles: [Role.ARTIST] };
const subscriberActor = { id: 'sub-1', roles: [Role.SUBSCRIBER] };

const makeUser = (overrides: Record<string, unknown> = {}) => ({
  id: 'user-1',
  email: 'user@test.com',
  status: AccountStatus.ACTIVE,
  roles: [{ role: Role.SUBSCRIBER }],
  ...overrides,
});

const makeAssignment = (overrides: Record<string, unknown> = {}) => ({
  id: 'assign-1',
  userId: 'user-1',
  tierId: 't-silver',
  startsAt: new Date('2026-08-01T00:00:00.000Z'),
  expiresAt: new Date('2026-09-01T00:00:00.000Z'),
  revokedAt: null,
  revokedById: null,
  internalNote: null,
  ...overrides,
});

function expectDataMatch(mock: jest.Mock, expected: Record<string, unknown>) {
  const calls = mock.mock.calls as [{ data: Record<string, unknown> }][];
  const first = calls.at(0);

  expect(first?.[0]?.data).toMatchObject(expected);
}

describe('TierAccessAdminService', () => {
  let service: TierAccessAdminService;
  let prisma: {
    user: { findUnique: jest.Mock };
    tier: { findUnique: jest.Mock };
    tierAccessAssignment: {
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    tierAccessEvent: { create: jest.Mock; findMany: jest.Mock };
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      user: { findUnique: jest.fn() },
      tier: { findUnique: jest.fn() },
      tierAccessAssignment: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      tierAccessEvent: { create: jest.fn(), findMany: jest.fn() },
      $transaction: jest.fn(),
    };
    prisma.$transaction.mockImplementation(((operation: unknown) => {
      if (typeof operation === 'function') {
        return (operation as (tx: typeof prisma) => unknown)(prisma);
      }
      if (Array.isArray(operation)) {
        return Promise.all(operation as Promise<unknown>[]);
      }
      return undefined;
    }) as never);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TierAccessAdminService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<TierAccessAdminService>(TierAccessAdminService);
  });

  it('allows SUPER_ADMIN to grant fixed-term access', async () => {
    prisma.user.findUnique.mockResolvedValue(makeUser());
    prisma.tier.findUnique.mockResolvedValue({
      id: 't-silver',
      name: 'Silver',
      priority: 2,
    });
    prisma.tierAccessAssignment.findUnique.mockResolvedValue(null);
    prisma.tierAccessAssignment.create.mockResolvedValue(makeAssignment());
    prisma.tierAccessEvent.create.mockResolvedValue({ id: 'event-1' });

    const result = await service.grant(adminActor, 'user-1', {
      tierId: 't-silver',
      startsAt: new Date('2026-08-01T00:00:00.000Z'),
      expiresAt: new Date('2026-09-01T00:00:00.000Z'),
      permanent: false,
      internalNote: 'Pago',
    });

    const createData = {
      userId: 'user-1',
      tierId: 't-silver',
      createdById: 'super-1',
    };

    expectDataMatch(prisma.tierAccessAssignment.create, createData);

    const eventData = {
      action: 'GRANTED',
      newTierId: 't-silver',
      actorId: 'super-1',
      internalNote: 'Pago',
    };

    expectDataMatch(prisma.tierAccessEvent.create, eventData);
    expect(result.event.id).toBe('event-1');
  });

  it('allows ARTIST to grant permanent access', async () => {
    prisma.user.findUnique.mockResolvedValue(makeUser());
    prisma.tier.findUnique.mockResolvedValue({
      id: 't-gold',
      name: 'Gold',
      priority: 5,
    });
    prisma.tierAccessAssignment.findUnique.mockResolvedValue(null);
    prisma.tierAccessAssignment.create.mockResolvedValue(
      makeAssignment({ tierId: 't-gold', expiresAt: null }),
    );
    prisma.tierAccessEvent.create.mockResolvedValue({ id: 'event-1' });

    const result = await service.grant(artistActor, 'user-1', {
      tierId: 't-gold',
      startsAt: new Date('2026-08-01T00:00:00.000Z'),
      expiresAt: null,
      permanent: true,
    });

    const createData = { tierId: 't-gold', expiresAt: null };

    expectDataMatch(prisma.tierAccessAssignment.create, createData);
    expect(result.event.id).toBe('event-1');
  });

  it('denies grant to a subscriber', async () => {
    await expect(
      service.grant(subscriberActor, 'user-1', {
        tierId: 't-silver',
        startsAt: new Date(),
        expiresAt: new Date(),
        permanent: false,
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('rejects a hidden SUPER_ADMIN target', async () => {
    prisma.user.findUnique.mockResolvedValue(
      makeUser({ roles: [{ role: Role.SUPER_ADMIN }] }),
    );

    await expect(
      service.grant(adminActor, 'root-1', {
        tierId: 't-silver',
        startsAt: new Date(),
        expiresAt: new Date(),
        permanent: false,
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('rejects an invalid tier', async () => {
    prisma.user.findUnique.mockResolvedValue(makeUser());
    prisma.tier.findUnique.mockResolvedValue(null);

    await expect(
      service.grant(adminActor, 'user-1', {
        tierId: 'missing',
        startsAt: new Date(),
        expiresAt: new Date(),
        permanent: false,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects expiration before start', async () => {
    prisma.user.findUnique.mockResolvedValue(makeUser());
    prisma.tier.findUnique.mockResolvedValue({
      id: 't-silver',
      name: 'Silver',
      priority: 2,
    });

    await expect(
      service.grant(adminActor, 'user-1', {
        tierId: 't-silver',
        startsAt: new Date('2026-09-01T00:00:00.000Z'),
        expiresAt: new Date('2026-08-01T00:00:00.000Z'),
        permanent: false,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('renews an expired assignment and records RENEWED', async () => {
    prisma.user.findUnique.mockResolvedValue(makeUser());
    prisma.tierAccessAssignment.findUnique.mockResolvedValue(
      makeAssignment({ expiresAt: new Date('2026-08-05T00:00:00.000Z') }),
    );
    prisma.tierAccessAssignment.update.mockResolvedValue(
      makeAssignment({ expiresAt: new Date('2026-10-01T00:00:00.000Z') }),
    );
    prisma.tierAccessEvent.create.mockResolvedValue({ id: 'event-1' });

    const result = await service.renew(adminActor, 'user-1', {
      expiresAt: new Date('2026-10-01T00:00:00.000Z'),
      internalNote: 'Renovado',
    });

    const eventData = {
      action: 'RENEWED',
      previousExpiresAt: new Date('2026-08-05T00:00:00.000Z'),
      newExpiresAt: new Date('2026-10-01T00:00:00.000Z'),
    };

    expectDataMatch(prisma.tierAccessEvent.create, eventData);
    expect(result.event.id).toBe('event-1');
  });

  it('changes tier and preserves previous tier in history', async () => {
    prisma.user.findUnique.mockResolvedValue(makeUser());
    prisma.tierAccessAssignment.findUnique.mockResolvedValue(makeAssignment());
    prisma.tier.findUnique.mockResolvedValue({
      id: 't-gold',
      name: 'Gold',
      priority: 5,
    });
    prisma.tierAccessAssignment.update.mockResolvedValue(
      makeAssignment({ tierId: 't-gold' }),
    );
    prisma.tierAccessEvent.create.mockResolvedValue({ id: 'event-1' });

    const result = await service.update(adminActor, 'user-1', {
      tierId: 't-gold',
    });

    const eventData = {
      previousTierId: 't-silver',
      newTierId: 't-gold',
    };

    expectDataMatch(prisma.tierAccessEvent.create, eventData);
    expect(result.event.id).toBe('event-1');
  });

  it('revokes an active assignment and records REVOKED', async () => {
    prisma.user.findUnique.mockResolvedValue(makeUser());
    prisma.tierAccessAssignment.findUnique.mockResolvedValue(makeAssignment());
    prisma.tierAccessAssignment.update.mockResolvedValue(
      makeAssignment({ revokedAt: new Date() }),
    );
    prisma.tierAccessEvent.create.mockResolvedValue({ id: 'event-1' });

    const result = await service.revoke(adminActor, 'user-1', 'Não pagou');

    const updateData = {
      revokedById: 'super-1',
    };

    expectDataMatch(prisma.tierAccessAssignment.update, updateData);

    const updateCalls = prisma.tierAccessAssignment.update.mock.calls as [
      { data: { revokedAt?: unknown } },
    ][];
    expect(updateCalls.at(0)?.[0]?.data?.revokedAt).toBeInstanceOf(Date);

    const eventData = {
      action: 'REVOKED',
      internalNote: 'Não pagou',
    };

    expectDataMatch(prisma.tierAccessEvent.create, eventData);
    expect(result.event.id).toBe('event-1');
  });

  it('denies revocation to a subscriber', async () => {
    await expect(service.revoke(subscriberActor, 'user-1')).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('returns history in reverse chronological order with actor info', async () => {
    prisma.user.findUnique.mockResolvedValue(makeUser());
    prisma.tierAccessEvent.findMany.mockResolvedValue([
      { id: 'e1', action: 'REVOKED', actor: { id: 'super-1' } },
    ]);

    const result = await service.getHistory('user-1');

    expect(prisma.tierAccessEvent.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user-1' },
        orderBy: { createdAt: 'desc' },
      }),
    );
    expect(result).toHaveLength(1);
  });
});
