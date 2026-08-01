import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PasswordService } from './password.service';

/**
 * Idempotently bootstraps the initial hidden SUPER_ADMIN account using secure
 * environment configuration. It never uses hardcoded credentials and never
 * overwrites an existing account password.
 */
@Injectable()
export class BootstrapService implements OnApplicationBootstrap {
  private readonly logger = new Logger(BootstrapService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly passwordService: PasswordService,
  ) {}

  async onApplicationBootstrap() {
    const enabled =
      this.config.get<string>('SUPER_ADMIN_BOOTSTRAP_ENABLED') === 'true';

    if (!enabled) {
      return;
    }

    const email = this.config.get<string>('SUPER_ADMIN_EMAIL');
    const password = this.config.get<string>('SUPER_ADMIN_PASSWORD');

    if (!email || !password) {
      this.logger.warn(
        'SUPER_ADMIN bootstrap is enabled but SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASSWORD is missing. No account was created.',
      );

      return;
    }

    const existing = await this.prisma.user.findFirst({
      where: { roles: { some: { role: Role.SUPER_ADMIN } } },
    });

    if (existing) {
      this.logger.log(
        'SUPER_ADMIN bootstrap skipped: a SUPER_ADMIN account already exists.',
      );

      return;
    }

    const passwordHash = await this.passwordService.hash(password);
    const name = this.config.get<string>('SUPER_ADMIN_NAME');

    await this.prisma.user.create({
      data: {
        email: email.trim().toLowerCase(),
        passwordHash,
        name: name ?? 'System Administrator',
        roles: { create: [{ role: Role.SUPER_ADMIN }] },
      },
    });

    this.logger.log(
      'SUPER_ADMIN bootstrap completed: initial system account created.',
    );
  }
}
