import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import { TierAccessService } from './tier-access.service';
import { PrismaService } from '../prisma/prisma.service';

const artistActor = { id: 'artist-1', roles: [Role.ARTIST] };

const makeUser = (overrides: Record<string, unknown> = {}) => ({
  id: 'user-1',
  email: 'user@test.com',
  name: null,
  status: 'ACTIVE',
  roles: [{ role: Role.SUBSCRIBER }],
  ...overrides,
});

const makeAssignment = (overrides: Record<string, unknown> = {}) => ({
  id: 'assign-1',
  userId: 'user-1',
  tierId: 't-silver',
  startsAt: new Date('2026-08-01T00:00:00.000Z'),
  expiresAt: null,
  revokedAt: null,
  tier: { id: 't-silver', name: 'Silver', priority: 2 },
  ...overrides,
});

describe('TierAccessService', () => {
  let service: TierAccessService;
  let prisma: {
    tierAccessAssignment: { findUnique: jest.Mock };
    user: { findUnique: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      tierAccessAssignment: { findUnique: jest.fn() },
      user: { findUnique: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TierAccessService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<TierAccessService>(TierAccessService);
  });

  const now = new Date('2026-08-10T00:00:00.000Z');

  it('returns NONE when there is no assignment', async () => {
    prisma.user.findUnique.mockResolvedValue(makeUser());
    prisma.tierAccessAssignment.findUnique.mockResolvedValue(null);

    const result = await service.getEffectiveAccess('user-1', now, artistActor);

    expect(result.status).toBe('NONE');
    expect(result.tierPriority).toBeNull();
  });

  it('derives ACTIVE for a valid interval', async () => {
    prisma.tierAccessAssignment.findUnique.mockResolvedValue(
      makeAssignment({ expiresAt: new Date('2026-09-01T00:00:00.000Z') }),
    );

    const result = await service.getEffectiveAccess('user-1', now, artistActor);

    expect(result.status).toBe('ACTIVE');
    expect(result.tier?.name).toBe('Silver');
    expect(result.tierPriority).toBe(2);
  });

  it('derives PERMANENT for an assignment without expiration', async () => {
    prisma.tierAccessAssignment.findUnique.mockResolvedValue(makeAssignment());

    const result = await service.getEffectiveAccess('user-1', now, artistActor);

    expect(result.status).toBe('PERMANENT');
    expect(result.permanent).toBe(true);
  });

  it('derives SCHEDULED before the start date', async () => {
    prisma.tierAccessAssignment.findUnique.mockResolvedValue(
      makeAssignment({ startsAt: new Date('2026-09-01T00:00:00.000Z') }),
    );

    const result = await service.getEffectiveAccess('user-1', now, artistActor);

    expect(result.status).toBe('SCHEDULED');
    expect(result.tierPriority).toBeNull();
  });

  it('derives EXPIRED at and after the expiration instant (exclusive end)', async () => {
    const expiresAt = new Date('2026-08-10T00:00:00.000Z');
    prisma.tierAccessAssignment.findUnique.mockResolvedValue(
      makeAssignment({ expiresAt }),
    );

    const atExpiration = await service.getEffectiveAccess(
      'user-1',
      expiresAt,
      artistActor,
    );
    expect(atExpiration.status).toBe('EXPIRED');
    expect(atExpiration.tierPriority).toBeNull();

    const after = await service.getEffectiveAccess(
      'user-1',
      new Date(expiresAt.getTime() + 1000),
      artistActor,
    );
    expect(after.status).toBe('EXPIRED');
    expect(after.tierPriority).toBeNull();
  });

  it('is ACTIVE just before expiration (exclusive end)', async () => {
    const expiresAt = new Date('2026-08-10T00:00:00.000Z');
    prisma.tierAccessAssignment.findUnique.mockResolvedValue(
      makeAssignment({ expiresAt }),
    );

    const result = await service.getEffectiveAccess(
      'user-1',
      new Date(expiresAt.getTime() - 1000),
      artistActor,
    );

    expect(result.status).toBe('EXPIRING_SOON');
  });

  it('derives EXPIRING_SOON within the warning window', async () => {
    const expiresAt = new Date('2026-08-12T00:00:00.000Z');
    prisma.tierAccessAssignment.findUnique.mockResolvedValue(
      makeAssignment({ expiresAt }),
    );

    const result = await service.getEffectiveAccess('user-1', now, artistActor);

    expect(result.status).toBe('EXPIRING_SOON');
    expect(result.expiringSoon).toBe(true);
  });

  it('derives REVOKED for a revoked assignment', async () => {
    prisma.tierAccessAssignment.findUnique.mockResolvedValue(
      makeAssignment({ revokedAt: new Date('2026-08-05T00:00:00.000Z') }),
    );

    const result = await service.getEffectiveAccess('user-1', now, artistActor);

    expect(result.status).toBe('REVOKED');
    expect(result.revoked).toBe(true);
  });
});
