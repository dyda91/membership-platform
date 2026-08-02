import { Injectable } from '@nestjs/common';
import { SecurityAction } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Records privacy-safe account-security audit events. Only non-sensitive
 * metadata is stored; passwords, raw reset tokens, authorization headers and
 * SMTP credentials are never persisted here.
 */
@Injectable()
export class SecurityAuditService {
  constructor(private readonly prisma: PrismaService) {}

  record(
    userId: string,
    action: SecurityAction,
    metadata?: Record<string, unknown>,
  ) {
    return this.prisma.securityAuditEvent.create({
      data: {
        userId,
        action,
        metadataJson: metadata ? JSON.stringify(metadata) : null,
      },
    });
  }
}
