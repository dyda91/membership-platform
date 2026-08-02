import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { canAccessContent } from '../common/content-access.util';
import type { ContentViewer } from '../common/content-access.util';

export type TierAccessStatus =
  | 'NONE'
  | 'SCHEDULED'
  | 'ACTIVE'
  | 'EXPIRING_SOON'
  | 'EXPIRED'
  | 'REVOKED'
  | 'PERMANENT';

export interface EffectiveTier {
  id: string;
  name: string;
  priority: number;
}

export interface EffectiveAccess {
  roleBypass: boolean;
  status: TierAccessStatus;
  tier: EffectiveTier | null;
  tierPriority: number | null;
  startsAt: string | null;
  expiresAt: string | null;
  permanent: boolean;
  expiringSoon: boolean;
  revoked: boolean;
}

export interface AccessAssignmentData {
  tierId: string;
  startsAt: Date;
  expiresAt: Date | null;
  permanent: boolean;
}

export interface TierAccessActor {
  id: string;
  roles: Role[];
}

export const DEFAULT_EXPIRING_SOON_DAYS = 7;

@Injectable()
export class TierAccessService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Derives effective access for a user at the given instant.
   * Authorization must never depend on a scheduler; validity is computed here
   * at request time using UTC-safe comparisons.
   */
  async getEffectiveAccess(
    userId: string,
    now: Date = new Date(),
    actor?: TierAccessActor,
  ): Promise<EffectiveAccess> {
    const roles = actor?.roles ?? (await this.loadRoles(userId));
    const roleBypass =
      roles.includes(Role.ARTIST) || roles.includes(Role.SUPER_ADMIN);

    const assignment = await this.prisma.tierAccessAssignment.findUnique({
      where: { userId },
      include: { tier: true },
    });

    if (!assignment) {
      return {
        roleBypass,
        status: 'NONE',
        tier: null,
        tierPriority: null,
        startsAt: null,
        expiresAt: null,
        permanent: false,
        expiringSoon: false,
        revoked: false,
      };
    }

    const tier = assignment.tier
      ? {
          id: assignment.tier.id,
          name: assignment.tier.name,
          priority: assignment.tier.priority,
        }
      : null;

    const permanent = assignment.expiresAt === null;
    const startsAt = assignment.startsAt.toISOString();
    const expiresAt = assignment.expiresAt?.toISOString() ?? null;

    if (assignment.revokedAt) {
      return {
        roleBypass,
        status: 'REVOKED',
        tier,
        tierPriority: null,
        startsAt,
        expiresAt,
        permanent,
        expiringSoon: false,
        revoked: true,
      };
    }

    if (now < assignment.startsAt) {
      return {
        roleBypass,
        status: 'SCHEDULED',
        tier,
        tierPriority: null,
        startsAt,
        expiresAt,
        permanent,
        expiringSoon: false,
        revoked: false,
      };
    }

    if (assignment.expiresAt !== null && now >= assignment.expiresAt) {
      return {
        roleBypass,
        status: 'EXPIRED',
        tier,
        tierPriority: null,
        startsAt,
        expiresAt,
        permanent: false,
        expiringSoon: false,
        revoked: false,
      };
    }

    // Active now: startsAt <= now < expiresAt (or permanent).
    const warningMs = DEFAULT_EXPIRING_SOON_DAYS * 24 * 60 * 60 * 1000;
    const expiringSoon =
      assignment.expiresAt !== null &&
      now >= new Date(assignment.expiresAt.getTime() - warningMs);

    const status: TierAccessStatus = permanent
      ? 'PERMANENT'
      : expiringSoon
        ? 'EXPIRING_SOON'
        : 'ACTIVE';

    return {
      roleBypass,
      status,
      tier,
      tierPriority: tier?.priority ?? null,
      startsAt,
      expiresAt,
      permanent,
      expiringSoon,
      revoked: false,
    };
  }

  /**
   * Viewer used by feed/media authorization for a user.
   */
  async getContentViewer(
    userId: string,
    now: Date = new Date(),
  ): Promise<ContentViewer> {
    const access = await this.getEffectiveAccess(userId, now);

    return {
      roles: await this.loadRoles(userId),
      tierPriority: access.roleBypass ? null : access.tierPriority,
    };
  }

  async canAccess(
    userId: string,
    requiredTier: { priority: number } | null,
    now: Date = new Date(),
  ) {
    const viewer = await this.getContentViewer(userId, now);

    return canAccessContent(viewer, requiredTier);
  }

  private async loadRoles(userId: string): Promise<Role[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { roles: true },
    });

    return user?.roles.map((item) => item.role) ?? [];
  }
}
