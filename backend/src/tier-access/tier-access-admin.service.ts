import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AccountStatus, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { TierAccessActor } from './tier-access.service';

export interface AccessChangeResult {
  assignment: unknown;
  event: unknown;
}

@Injectable()
export class TierAccessAdminService {
  constructor(private readonly prisma: PrismaService) {}

  private assertCanManage(actor: TierAccessActor) {
    if (
      !actor.roles.includes(Role.ARTIST) &&
      !actor.roles.includes(Role.SUPER_ADMIN)
    ) {
      throw new ForbiddenException(
        'Only ARTIST or SUPER_ADMIN can manage tier access',
      );
    }
  }

  private async loadEligibleUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { roles: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.roles.some((item) => item.role === Role.SUPER_ADMIN)) {
      throw new NotFoundException('User not found');
    }

    if (user.status !== AccountStatus.ACTIVE) {
      throw new BadRequestException(
        'Inactive accounts cannot be granted tier access',
      );
    }

    return user;
  }

  private async validateTier(tierId: string) {
    const tier = await this.prisma.tier.findUnique({ where: { id: tierId } });

    if (!tier) {
      throw new BadRequestException('Tier not found');
    }

    return tier;
  }

  private validateDates(startsAt: Date, expiresAt: Date | null) {
    if (expiresAt !== null && expiresAt <= startsAt) {
      throw new BadRequestException('expiresAt must be after startsAt');
    }
  }

  /**
   * Grants (or replaces) the current access assignment and records a GRANTED
   * history event atomically.
   */
  async grant(
    actor: TierAccessActor,
    userId: string,
    data: {
      tierId: string;
      startsAt: Date;
      expiresAt: Date | null;
      permanent: boolean;
      internalNote?: string;
    },
  ) {
    this.assertCanManage(actor);
    await this.loadEligibleUser(userId);
    const tier = await this.validateTier(data.tierId);
    const startsAt = data.startsAt;
    const expiresAt = data.permanent ? null : data.expiresAt;

    if (data.permanent) {
      // expiresAt must be null for permanent access
    } else if (expiresAt === null) {
      throw new BadRequestException(
        'expiresAt is required for non-permanent access',
      );
    }

    this.validateDates(startsAt, expiresAt);

    return this.prisma.$transaction(async (tx) => {
      const previous = await tx.tierAccessAssignment.findUnique({
        where: { userId },
      });

      const assignment = previous
        ? await tx.tierAccessAssignment.update({
            where: { userId },
            data: {
              tierId: tier.id,
              startsAt,
              expiresAt,
              revokedAt: null,
              revokedById: null,
              updatedById: actor.id,
              internalNote: data.internalNote ?? null,
            },
          })
        : await tx.tierAccessAssignment.create({
            data: {
              userId,
              tierId: tier.id,
              startsAt,
              expiresAt,
              createdById: actor.id,
              updatedById: actor.id,
              internalNote: data.internalNote ?? null,
            },
          });

      const event = await tx.tierAccessEvent.create({
        data: {
          assignmentId: assignment.id,
          userId,
          action: 'GRANTED',
          previousTierId: previous?.tierId ?? null,
          newTierId: tier.id,
          previousStartsAt: previous?.startsAt ?? null,
          newStartsAt: startsAt,
          previousExpiresAt: previous?.expiresAt ?? null,
          newExpiresAt: expiresAt,
          actorId: actor.id,
          internalNote: data.internalNote ?? null,
        },
      });

      return { assignment, event };
    });
  }

  /**
   * Renews an existing assignment by extending its expiration. Creates a
   * RENEWED history event.
   */
  async renew(
    actor: TierAccessActor,
    userId: string,
    data: {
      expiresAt: Date;
      permanent?: boolean;
      internalNote?: string;
    },
  ) {
    this.assertCanManage(actor);
    await this.loadEligibleUser(userId);

    return this.prisma.$transaction(async (tx) => {
      const assignment = await tx.tierAccessAssignment.findUnique({
        where: { userId },
      });

      if (!assignment) {
        throw new BadRequestException('No active access assignment to renew');
      }

      if (assignment.revokedAt) {
        throw new BadRequestException(
          'Access was revoked; grant a new assignment instead',
        );
      }

      const newExpiresAt = data.permanent ? null : data.expiresAt;

      this.validateDates(assignment.startsAt, newExpiresAt);

      const updated = await tx.tierAccessAssignment.update({
        where: { userId },
        data: {
          expiresAt: newExpiresAt,
          updatedById: actor.id,
          internalNote: data.internalNote ?? assignment.internalNote,
        },
      });

      const event = await tx.tierAccessEvent.create({
        data: {
          assignmentId: assignment.id,
          userId,
          action: 'RENEWED',
          previousTierId: assignment.tierId,
          newTierId: assignment.tierId,
          previousStartsAt: assignment.startsAt,
          newStartsAt: assignment.startsAt,
          previousExpiresAt: assignment.expiresAt,
          newExpiresAt,
          actorId: actor.id,
          internalNote: data.internalNote ?? null,
        },
      });

      return { assignment: updated, event };
    });
  }

  /**
   * Updates tier and/or dates on an existing assignment, preserving previous
   * values in a history event. If only the tier changed, TIER_CHANGED is used;
   * otherwise DATES_CHANGED (or both fields when both change).
   */
  async update(
    actor: TierAccessActor,
    userId: string,
    data: {
      tierId?: string;
      startsAt?: Date;
      expiresAt?: Date | null;
      permanent?: boolean;
      internalNote?: string;
    },
  ) {
    this.assertCanManage(actor);
    await this.loadEligibleUser(userId);

    return this.prisma.$transaction(async (tx) => {
      const assignment = await tx.tierAccessAssignment.findUnique({
        where: { userId },
      });

      if (!assignment) {
        throw new BadRequestException('No current access assignment to update');
      }

      let tierId = assignment.tierId;

      if (data.tierId && data.tierId !== assignment.tierId) {
        await this.validateTier(data.tierId);
        tierId = data.tierId;
      }

      const startsAt = data.startsAt ?? assignment.startsAt;
      const expiresAt = data.permanent
        ? null
        : data.expiresAt !== undefined
          ? data.expiresAt
          : assignment.expiresAt;

      this.validateDates(startsAt, expiresAt);

      const tierChanged = tierId !== assignment.tierId;
      const datesChanged =
        startsAt.getTime() !== assignment.startsAt.getTime() ||
        expiresAt?.getTime() !== assignment.expiresAt?.getTime();

      const action =
        tierChanged && datesChanged
          ? ('DATES_CHANGED' as const)
          : tierChanged
            ? ('TIER_CHANGED' as const)
            : ('DATES_CHANGED' as const);

      const updated = await tx.tierAccessAssignment.update({
        where: { userId },
        data: {
          tierId,
          startsAt,
          expiresAt,
          updatedById: actor.id,
          internalNote: data.internalNote ?? assignment.internalNote,
        },
      });

      const event = await tx.tierAccessEvent.create({
        data: {
          assignmentId: assignment.id,
          userId,
          action,
          previousTierId: assignment.tierId,
          newTierId: tierId,
          previousStartsAt: assignment.startsAt,
          newStartsAt: startsAt,
          previousExpiresAt: assignment.expiresAt,
          newExpiresAt: expiresAt,
          actorId: actor.id,
          internalNote: data.internalNote ?? null,
        },
      });

      return { assignment: updated, event };
    });
  }

  /**
   * Revokes the current assignment immediately. Records a REVOKED event and
   * clears the user's effective tier for content access.
   */
  async revoke(actor: TierAccessActor, userId: string, internalNote?: string) {
    this.assertCanManage(actor);
    await this.loadEligibleUser(userId);

    return this.prisma.$transaction(async (tx) => {
      const assignment = await tx.tierAccessAssignment.findUnique({
        where: { userId },
      });

      if (!assignment) {
        throw new BadRequestException('No active access assignment to revoke');
      }

      if (assignment.revokedAt) {
        throw new BadRequestException('Access is already revoked');
      }

      const updated = await tx.tierAccessAssignment.update({
        where: { userId },
        data: {
          revokedAt: new Date(),
          revokedById: actor.id,
          updatedById: actor.id,
          internalNote: internalNote ?? assignment.internalNote,
        },
      });

      const event = await tx.tierAccessEvent.create({
        data: {
          assignmentId: assignment.id,
          userId,
          action: 'REVOKED',
          previousTierId: assignment.tierId,
          newTierId: assignment.tierId,
          previousStartsAt: assignment.startsAt,
          newStartsAt: assignment.startsAt,
          previousExpiresAt: assignment.expiresAt,
          newExpiresAt: assignment.expiresAt,
          actorId: actor.id,
          internalNote: internalNote ?? null,
        },
      });

      return { assignment: updated, event };
    });
  }

  /**
   * Returns the access history for a member in reverse chronological order,
   * including safe actor identity and internal notes (admin-only context).
   */
  async getHistory(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const events = await this.prisma.tierAccessEvent.findMany({
      where: { userId },
      include: {
        previousTier: { select: { id: true, name: true } },
        newTier: { select: { id: true, name: true } },
        actor: { select: { id: true, email: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return events;
  }
}
