import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { REQUIRED_TIER_KEY } from './required-tier.decorator';

@Injectable()
export class TierGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPriority = this.reflector.getAllAndOverride<number>(
      REQUIRED_TIER_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (requiredPriority === undefined) {
      return true;
    }

    const { user } = context
      .switchToHttp()
      .getRequest<{ user: AuthenticatedUser }>();

    if (!user?.tier || user.tier.priority < requiredPriority) {
      throw new ForbiddenException('Insufficient tier for this resource');
    }

    return true;
  }
}
