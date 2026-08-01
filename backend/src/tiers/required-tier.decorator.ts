import { SetMetadata } from '@nestjs/common';

export const REQUIRED_TIER_KEY = 'requiredTier';

export const RequireTier = (priority: number) =>
  SetMetadata(REQUIRED_TIER_KEY, priority);
