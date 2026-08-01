import { Role } from '@prisma/client';

export interface ContentViewer {
  roles: Role[];
  tierPriority: number | null;
}

export interface RequiredTier {
  priority: number;
}

export type ContentAccessDecision =
  | { allowed: true }
  | { allowed: false; reason: 'unauthorized' | 'insufficient_tier' };

/**
 * Evaluates whether a viewer may access media gated behind an optional tier.
 *
 * Rules:
 * - no required tier: allow
 * - SUPER_ADMIN or ARTIST: allow
 * - viewer has no tier priority: deny
 * - viewer priority >= required priority: allow (cumulative)
 * - otherwise: deny
 */
export function canAccessContent(
  viewer: ContentViewer | null,
  requiredTier: RequiredTier | null,
): ContentAccessDecision {
  if (!requiredTier) {
    return { allowed: true };
  }

  if (!viewer) {
    return { allowed: false, reason: 'unauthorized' };
  }

  const isManager =
    viewer.roles.includes(Role.SUPER_ADMIN) ||
    viewer.roles.includes(Role.ARTIST);

  if (isManager) {
    return { allowed: true };
  }

  if (viewer.tierPriority === null || viewer.tierPriority === undefined) {
    return { allowed: false, reason: 'insufficient_tier' };
  }

  if (viewer.tierPriority >= requiredTier.priority) {
    return { allowed: true };
  }

  return { allowed: false, reason: 'insufficient_tier' };
}
