import { Test, TestingModule } from '@nestjs/testing';
import { PostStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  let service: DashboardService;

  const prisma = {
    user: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    post: {
      count: jest.fn(),
    },
    tier: {
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(DashboardService);
  });

  it('computes access-state totals using effective-access rules', async () => {
    prisma.user.count.mockResolvedValue(4);
    prisma.post.count.mockImplementation(
      (args: { where: { status?: PostStatus } }) => {
        if (args.where.status === PostStatus.PUBLISHED)
          return Promise.resolve(2);
        if (args.where.status === PostStatus.DRAFT) return Promise.resolve(1);
        return Promise.resolve(1);
      },
    );
    prisma.tier.count.mockResolvedValue(3);
    prisma.user.findMany.mockResolvedValue([
      {
        tierAssignments: [
          {
            startsAt: new Date('2026-01-01'),
            expiresAt: null,
            revokedAt: null,
          },
        ],
      }, // permanent
      {
        tierAssignments: [
          {
            startsAt: new Date('2026-01-01'),
            expiresAt: new Date('2099-01-01'),
            revokedAt: null,
          },
        ],
      }, // active
      {
        tierAssignments: [
          {
            startsAt: new Date('2026-01-01'),
            expiresAt: new Date('2026-06-01'),
            revokedAt: null,
          },
        ],
      }, // expired
      {
        tierAssignments: [
          {
            startsAt: new Date('2026-01-01'),
            expiresAt: new Date('2099-01-01'),
            revokedAt: new Date('2026-01-02'),
          },
        ],
      }, // revoked
      { tierAssignments: [] }, // none
    ]);

    const result = await service.summary();

    expect(result.visibleUsers).toBe(4);
    expect(result.publishedPosts).toBe(2);
    expect(result.draftPosts).toBe(1);
    expect(result.archivedPosts).toBe(1);
    expect(result.tiers).toBe(3);
    expect(result.permanentAccess).toBe(1);
    expect(result.activeAccess).toBe(1);
    expect(result.expiredAccess).toBe(1);
    expect(result.revokedAccess).toBe(1);
    expect(result.scheduledAccess).toBe(0);
    expect(result.expiringSoonAccess).toBe(0);
  });

  it('counts scheduled and expiring-soon access', async () => {
    prisma.user.count.mockResolvedValue(2);
    prisma.post.count.mockResolvedValue(0);
    prisma.tier.count.mockResolvedValue(1);
    prisma.user.findMany.mockResolvedValue([
      {
        tierAssignments: [
          {
            startsAt: new Date('2099-01-01'),
            expiresAt: new Date('2099-06-01'),
            revokedAt: null,
          },
        ],
      }, // scheduled
      {
        tierAssignments: [
          {
            startsAt: new Date('2026-01-01'),
            expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            revokedAt: null,
          },
        ],
      }, // expiring soon
    ]);

    const result = await service.summary();

    expect(result.scheduledAccess).toBe(1);
    expect(result.expiringSoonAccess).toBe(1);
  });
});
