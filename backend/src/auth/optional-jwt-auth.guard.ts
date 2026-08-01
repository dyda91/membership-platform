import { Injectable, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Authenticates the request when a valid Bearer token is present,
 * but allows the request to proceed without authentication.
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(OptionalJwtAuthGuard.name);

  handleRequest<TUser = any>(err: unknown, user: TUser | null): TUser | null {
    if (err) {
      const message =
        err instanceof Error ? err.message : 'unknown authentication error';

      this.logger.warn(`Optional auth failed: ${message}`);
    }

    return user ?? null;
  }
}
