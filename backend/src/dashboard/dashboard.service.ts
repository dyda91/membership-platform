import { Injectable } from '@nestjs/common';
import { PostStatus, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type EffectiveAccessState =
  | 'NONE'
  | 'SCHEDULED'
  | 'ACTIVE'
  | 'EXPIRING_SOON'
  | 'EXPIRED'
  | 'REVOKED'
  | 'PERMANENT';

interface AssignmentShape {
  startsAt: Date;
  expiresAt: Date | null;
  revokedAt: Date | null;
}

/**
 * Computes the effective access state for a single assignment using the same
 * rules as the user-management service: revoked wins, then scheduled, then
 * expired, then permanent / expiring-soon / active.
 */
function effectiveState(
  assignment: AssignmentShape | null,
  now: Date,
): EffectiveAccessState {
  if (!assignment) {
    return 'NONE';
  }

  if (assignment.revokedAt) {
    return 'REVOKED';
  }

  if (now < assignment.startsAt) {
    return 'SCHEDULED';
  }

  if (assignment.expiresAt !== null && now >= assignment.expiresAt) {
    return 'EXPIRED';
  }

  const permanent = assignment.expiresAt === null;

  if (permanent) {
    return 'PERMANENT';
  }

  const expiringSoon =
    now >=
    new Date(
      (assignment.expiresAt as Date).getTime() - 7 * 24 * 60 * 60 * 1000,
    );

  return expiringSoon ? 'EXPIRING_SOON' : 'ACTIVE';
}

export interface DashboardSummary {
  visibleUsers: number;
  publishedPosts: number;
  draftPosts: number;
  archivedPosts: number;
  tiers: number;
  activeAccess: number;
  expiringSoonAccess: number;
  expiredAccess: number;
  permanentAccess: number;
  scheduledAccess: number;
  revokedAccess: number;
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async summary(): Promise<DashboardSummary> {
    const now = new Date();

    const [
      visibleUsers,
      publishedPosts,
      draftPosts,
      archivedPosts,
      tiers,
      users,
    ] = await Promise.all([
      this.prisma.user.count({
        where: { roles: { none: { role: Role.SUPER_ADMIN } } },
      }),
      this.prisma.post.count({ where: { status: PostStatus.PUBLISHED } }),
      this.prisma.post.count({ where: { status: PostStatus.DRAFT } }),
      this.prisma.post.count({ where: { status: PostStatus.ARCHIVED } }),
      this.prisma.tier.count(),
      this.prisma.user.findMany({
        where: { roles: { none: { role: Role.SUPER_ADMIN } } },
        select: {
          tierAssignments: {
            select: {
              startsAt: true,
              expiresAt: true,
              revokedAt: true,
            },
          },
        },
      }),
    ]);

    const counts: Record<EffectiveAccessState, number> = {
      NONE: 0,
      SCHEDULED: 0,
      ACTIVE: 0,
      EXPIRING_SOON: 0,
      EXPIRED: 0,
      REVOKED: 0,
      PERMANENT: 0,
    };

    for (const user of users) {
      const state = effectiveState(user.tierAssignments[0] ?? null, now);
      counts[state] += 1;
    }

    return {
      visibleUsers,
      publishedPosts,
      draftPosts,
      archivedPosts,
      tiers,
      activeAccess: counts.ACTIVE,
      expiringSoonAccess: counts.EXPIRING_SOON,
      expiredAccess: counts.EXPIRED,
      permanentAccess: counts.PERMANENT,
      scheduledAccess: counts.SCHEDULED,
      revokedAccess: counts.REVOKED,
    };
  }
}
