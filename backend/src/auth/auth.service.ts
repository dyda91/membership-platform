import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AccountStatus, Role, SecurityAction, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { PasswordService } from './password.service';
import { PasswordPolicyService } from './password-policy.service';
import { PasswordResetService } from './password-reset.service';
import { MailService } from '../mail/mail.service';
import { SecurityAuditService } from '../security/security-audit.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import type { AuthenticatedUser } from './jwt.strategy';

const DUMMY_HASH =
  '$2b$10$tYO0aEMQtbpG69T/r9q7YOK3YQalZm4T.e7eg36AerPH7DnmlIQEa';

const DEFAULT_MAX_FAILED_ATTEMPTS = 5;
const DEFAULT_BLOCK_DURATION_MS = 15 * 60 * 1000;

export interface LoginResult {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    status: AccountStatus;
    roles: Role[];
    tier: { id: string; name: string; priority: number } | null;
    createdAt: Date;
    updatedAt: Date;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
    private readonly passwordPolicy: PasswordPolicyService,
    private readonly passwordReset: PasswordResetService,
    private readonly mailService: MailService,
    private readonly securityAudit: SecurityAuditService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    const policy = this.passwordPolicy.validate(dto.password);

    if (!policy.valid) {
      throw new BadRequestException(policy.message);
    }

    const existingUser = await this.usersService.findByEmail(email);

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await this.passwordService.hash(dto.password);

    return this.usersService.create({
      email,
      name: dto.name,
      passwordHash,
    });
  }

  async login(dto: LoginDto): Promise<LoginResult> {
    const email = dto.email.trim().toLowerCase();
    const user = await this.usersService.findByEmail(email);
    const now = new Date();

    const eligible = Boolean(user && user.status === AccountStatus.ACTIVE);

    if (eligible && user!.loginBlockedUntil && user!.loginBlockedUntil > now) {
      // Timing-safe work while the account is temporarily protected.
      await this.passwordService.compare(dto.password, user!.passwordHash);

      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await this.passwordService.compare(
      dto.password,
      eligible ? user!.passwordHash : DUMMY_HASH,
    );

    if (!passwordValid || !eligible) {
      if (eligible) {
        await this.registerFailedAttempt(user!.id, user!.failedLoginAttempts);
      }

      throw new UnauthorizedException('Invalid credentials');
    }

    await this.prisma.user.update({
      where: { id: user!.id },
      data: {
        failedLoginAttempts: 0,
        loginBlockedUntil: null,
        lastFailedLoginAt: null,
      },
    });

    const payload = {
      sub: user!.id,
      email: user!.email,
      sessionVersion: user!.sessionVersion,
    };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: this.toSafeUser(user!),
    };
  }

  /**
   * Changes the password for the authenticated account. The account comes from
   * the session, never from the request body. All previously issued JWTs are
   * invalidated by incrementing sessionVersion.
   */
  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException();
    }

    const currentValid = await this.passwordService.compare(
      dto.currentPassword,
      user.passwordHash,
    );

    if (!currentValid) {
      throw new UnauthorizedException('Senha atual incorreta.');
    }

    const policy = this.passwordPolicy.validate(dto.newPassword);

    if (!policy.valid) {
      throw new BadRequestException(policy.message);
    }

    const newHash = await this.passwordService.hash(dto.newPassword);

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { passwordHash: newHash, sessionVersion: { increment: 1 } },
      });

      await tx.securityAuditEvent.create({
        data: { userId, action: SecurityAction.PASSWORD_CHANGED },
      });
    });

    return { success: true };
  }

  /**
   * Invalidates every previously issued JWT for the authenticated account.
   */
  async logoutAll(userId: string) {
    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { sessionVersion: { increment: 1 } },
      });

      await tx.securityAuditEvent.create({
        data: { userId, action: SecurityAction.LOGOUT_ALL_SESSIONS },
      });
    });

    return { success: true };
  }

  /**
   * Requests a password-reset e-mail for an eligible account. Always returns
   * the same generic wording so account existence is never revealed. Hidden
   * system accounts are never eligible.
   */
  async forgotPassword(dto: ForgotPasswordDto) {
    const email = dto.email.trim().toLowerCase();
    const generic =
      'Se uma conta existir para este e-mail, enviaremos instruções de recuperação.';

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { roles: true },
    });

    const eligible = Boolean(
      user &&
      user.status === AccountStatus.ACTIVE &&
      !user.roles.some((item) => item.role === Role.SUPER_ADMIN),
    );

    if (!eligible) {
      // Perform comparable work to reduce timing differences.
      await this.passwordService.compare('invalid', DUMMY_HASH);

      return { message: generic };
    }

    try {
      const { rawToken, expiresAt } = await this.passwordReset.createToken(
        user!.id,
      );

      await this.securityAudit.record(
        user!.id,
        SecurityAction.PASSWORD_RESET_REQUESTED,
      );

      await this.mailService.sendPasswordReset({
        to: email,
        token: rawToken,
        expiresAt,
      });
    } catch {
      // SMTP failure must not expose the token or account state.
    }

    return { message: generic };
  }

  /**
   * Completes a password reset transactionally: updates the hash, marks the
   * token used, invalidates outstanding tokens, increments sessionVersion and
   * records an audit event.
   */
  async resetPassword(dto: ResetPasswordDto) {
    const record = await this.passwordReset.findValidByRawToken(dto.token);
    const now = new Date();

    if (!record || record.usedAt || record.expiresAt <= now) {
      throw new UnauthorizedException('Link inválido ou expirado.');
    }

    const policy = this.passwordPolicy.validate(dto.newPassword);

    if (!policy.valid) {
      throw new BadRequestException(policy.message);
    }

    const newHash = await this.passwordService.hash(dto.newPassword);

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: record.userId },
        data: {
          passwordHash: newHash,
          sessionVersion: { increment: 1 },
          failedLoginAttempts: 0,
          loginBlockedUntil: null,
          lastFailedLoginAt: null,
        },
      });

      await tx.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: now },
      });

      await tx.passwordResetToken.updateMany({
        where: { userId: record.userId, usedAt: null },
        data: { usedAt: now },
      });

      await tx.securityAuditEvent.create({
        data: {
          userId: record.userId,
          action: SecurityAction.PASSWORD_RESET_COMPLETED,
        },
      });
    });

    return { success: true };
  }

  private async registerFailedAttempt(userId: string, currentAttempts: number) {
    const maxAttempts = this.maxFailedAttempts();
    const nextAttempts = currentAttempts + 1;
    const data: {
      failedLoginAttempts: number;
      lastFailedLoginAt: Date;
      loginBlockedUntil?: Date;
    } = {
      failedLoginAttempts: nextAttempts,
      lastFailedLoginAt: new Date(),
    };

    if (nextAttempts >= maxAttempts) {
      data.loginBlockedUntil = new Date(Date.now() + this.blockDurationMs());
    }

    await this.prisma.user.update({ where: { id: userId }, data });

    if (nextAttempts >= maxAttempts) {
      await this.securityAudit.record(
        userId,
        SecurityAction.LOGIN_TEMPORARILY_BLOCKED,
      );
    }
  }

  private maxFailedAttempts(): number {
    const value = Number(this.config.get('LOGIN_MAX_ATTEMPTS'));

    return Number.isFinite(value) && value > 0
      ? value
      : DEFAULT_MAX_FAILED_ATTEMPTS;
  }

  private blockDurationMs(): number {
    const value = Number(this.config.get('LOGIN_BLOCK_DURATION_MS'));

    return Number.isFinite(value) && value > 0
      ? value
      : DEFAULT_BLOCK_DURATION_MS;
  }

  /**
   * Builds the safe current-session payload for /auth/me.
   * It reflects the database-backed request user resolved by the JWT strategy.
   */
  buildSession(
    user: AuthenticatedUser,
    effectiveAccess?: {
      tier: { id: string; name: string; priority: number } | null;
      tierPriority: number | null;
      status: string;
      startsAt: string | null;
      expiresAt: string | null;
      permanent: boolean;
      expiringSoon: boolean;
    },
  ) {
    const roles = user.roles;
    const isSuperAdmin = roles.includes(Role.SUPER_ADMIN);
    const isArtist = roles.includes(Role.ARTIST);
    const isSubscriber = roles.includes(Role.SUBSCRIBER);

    // Effective access reflects the current valid assignment, not stale tier
    // data from the JWT or compatibility fields. Only granting states expose a
    // usable tier to the client.
    const grantingStates = ['ACTIVE', 'EXPIRING_SOON', 'PERMANENT'];
    const isGranting = effectiveAccess
      ? grantingStates.includes(effectiveAccess.status)
      : false;

    const effectiveTier =
      effectiveAccess && isGranting ? effectiveAccess.tier : null;
    const effectiveTierId = effectiveTier?.id ?? null;
    const effectiveTierPriority = effectiveTier?.priority ?? null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      status: user.status,
      roles,
      tier: effectiveTier,
      tierId: effectiveTierId,
      tierPriority: effectiveTierPriority,
      tierAccessStatus: effectiveAccess?.status ?? 'NONE',
      tierStartsAt: effectiveAccess?.startsAt ?? null,
      tierExpiresAt: effectiveAccess?.expiresAt ?? null,
      tierPermanent: effectiveAccess?.permanent ?? false,
      tierExpiringSoon: effectiveAccess?.expiringSoon ?? false,
      isSuperAdmin,
      isArtist,
      isSubscriber,
    };
  }

  private toSafeUser(
    user: User & {
      roles: { role: Role }[];
      tier: { id: string; name: string; priority: number } | null;
    },
  ) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      status: user.status,
      roles: user.roles.map((item) => item.role),
      tier: user.tier,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
