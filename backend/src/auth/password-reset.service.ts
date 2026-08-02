import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

const DEFAULT_TTL_SECONDS = 1800;

/**
 * Generates cryptographically secure, URL-safe password-reset tokens and
 * persists only their SHA-256 hashes. The raw token exists only long enough to
 * build the reset link and send the e-mail.
 */
@Injectable()
export class PasswordResetService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  ttlMs(): number {
    const seconds = Number(
      this.config.get('RESET_TOKEN_TTL_SECONDS') ?? DEFAULT_TTL_SECONDS,
    );

    return (
      (Number.isFinite(seconds) && seconds > 0
        ? seconds
        : DEFAULT_TTL_SECONDS) * 1000
    );
  }

  generateRawToken(): string {
    return randomBytes(32).toString('base64url');
  }

  hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  /**
   * Creates a reset record and returns the raw token. Outstanding unused
   * tokens for the same account are invalidated to prevent token accumulation.
   */
  async createToken(
    userId: string,
  ): Promise<{ rawToken: string; expiresAt: Date }> {
    const rawToken = this.generateRawToken();
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + this.ttlMs());

    await this.prisma.$transaction([
      this.prisma.passwordResetToken.updateMany({
        where: { userId, usedAt: null },
        data: { usedAt: new Date() },
      }),
      this.prisma.passwordResetToken.create({
        data: { userId, tokenHash, expiresAt },
      }),
    ]);

    return { rawToken, expiresAt };
  }

  async findValidByRawToken(rawToken: string) {
    if (!rawToken) {
      return null;
    }

    return this.prisma.passwordResetToken.findUnique({
      where: { tokenHash: this.hashToken(rawToken) },
      include: { user: true },
    });
  }

  async markUsed(id: string) {
    return this.prisma.passwordResetToken.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  }

  async invalidateAllOutstanding(userId: string) {
    return this.prisma.passwordResetToken.updateMany({
      where: { userId, usedAt: null },
      data: { usedAt: new Date() },
    });
  }
}
