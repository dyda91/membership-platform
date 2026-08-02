import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AccountStatus, Role, SecurityAction } from '@prisma/client';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { PasswordService } from './password.service';
import { PasswordPolicyService } from './password-policy.service';
import { PasswordResetService } from './password-reset.service';
import { MailService } from '../mail/mail.service';
import { SecurityAuditService } from '../security/security-audit.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;

  const user = {
    id: 'uuid-1',
    email: 'user@test.com',
    passwordHash: '$2b$10$hashed-value',
    name: null,
    status: AccountStatus.ACTIVE,
    roles: [{ userId: 'uuid-1', role: Role.SUBSCRIBER }],
    tier: null,
    sessionVersion: 0,
    failedLoginAttempts: 0,
    loginBlockedUntil: null,
    lastFailedLoginAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const safeUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    status: user.status,
    roles: [Role.SUBSCRIBER],
    tier: null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  let usersService: { findByEmail: jest.Mock; create: jest.Mock };
  let passwordService: { hash: jest.Mock; compare: jest.Mock };
  let jwtService: { signAsync: jest.Mock };
  let passwordPolicy: { validate: jest.Mock };
  let passwordReset: {
    createToken: jest.Mock;
    findValidByRawToken: jest.Mock;
    invalidateAllOutstanding: jest.Mock;
    markUsed: jest.Mock;
  };
  let mailService: { sendPasswordReset: jest.Mock };
  let securityAudit: { record: jest.Mock };
  let prisma: {
    user: { findUnique: jest.Mock; update: jest.Mock };
    securityAuditEvent: { create: jest.Mock };
    passwordResetToken: { update: jest.Mock; updateMany: jest.Mock };
    $transaction: jest.Mock;
  };
  let config: { get: jest.Mock<number | undefined, [string]> };

  const ANY_DATE = expect.any(Date) as Date;

  type Tx = {
    user: { update: jest.Mock };
    securityAuditEvent: { create: jest.Mock };
    passwordResetToken: { update: jest.Mock; updateMany: jest.Mock };
  };

  function tx(): Tx {
    return {
      user: { update: prisma.user.update },
      securityAuditEvent: { create: prisma.securityAuditEvent.create },
      passwordResetToken: {
        update: prisma.passwordResetToken.update,
        updateMany: prisma.passwordResetToken.updateMany,
      },
    };
  }

  beforeEach(async () => {
    usersService = { findByEmail: jest.fn(), create: jest.fn() };
    passwordService = { hash: jest.fn(), compare: jest.fn() };
    jwtService = { signAsync: jest.fn() };
    passwordPolicy = {
      validate: jest.fn(() => ({ valid: true, message: '' })),
    };
    passwordReset = {
      createToken: jest.fn(),
      findValidByRawToken: jest.fn(),
      invalidateAllOutstanding: jest.fn(),
      markUsed: jest.fn(),
    };
    mailService = { sendPasswordReset: jest.fn() };
    securityAudit = { record: jest.fn() };
    prisma = {
      user: { findUnique: jest.fn(), update: jest.fn() },
      securityAuditEvent: { create: jest.fn() },
      passwordResetToken: { update: jest.fn(), updateMany: jest.fn() },
      $transaction: jest.fn(),
    };
    prisma.$transaction.mockImplementation(async (arg: unknown) => {
      if (typeof arg === 'function') {
        return (arg as (t: Tx) => Promise<unknown>)(tx());
      }

      return Promise.all(arg as Promise<unknown>[]);
    });
    config = {
      get: jest.fn<number | undefined, [string]>(() => undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: PasswordService, useValue: passwordService },
        { provide: JwtService, useValue: jwtService },
        { provide: PasswordPolicyService, useValue: passwordPolicy },
        { provide: PasswordResetService, useValue: passwordReset },
        { provide: MailService, useValue: mailService },
        { provide: SecurityAuditService, useValue: securityAudit },
        { provide: PrismaService, useValue: prisma },
        { provide: ConfigService, useValue: config },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should create a user with a hashed password', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      passwordService.hash.mockResolvedValue('$2b$10$hashed-value');
      usersService.create.mockResolvedValue(safeUser);

      const result = await service.register({
        email: 'User@Test.com',
        password: 'secret123',
      });

      expect(passwordService.hash).toHaveBeenCalledWith('secret123');
      expect(usersService.create).toHaveBeenCalledWith({
        email: 'user@test.com',
        name: undefined,
        passwordHash: '$2b$10$hashed-value',
      });
      expect(result.email).toBe('user@test.com');
    });

    it('should reject a password that violates the policy', async () => {
      passwordPolicy.validate.mockReturnValue({
        valid: false,
        message: 'Senha muito curta.',
      });

      await expect(
        service.register({ email: 'user@test.com', password: 'short' }),
      ).rejects.toThrow(BadRequestException);
      expect(usersService.create).not.toHaveBeenCalled();
    });

    it('should reject registration when email is already registered', async () => {
      usersService.findByEmail.mockResolvedValue(user);

      await expect(
        service.register({ email: 'user@test.com', password: 'secret123' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should sign a token with the current sessionVersion', async () => {
      usersService.findByEmail.mockResolvedValue({
        ...user,
        sessionVersion: 3,
      });
      passwordService.compare.mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue('jwt-token');

      const result = await service.login({
        email: 'user@test.com',
        password: 'secret123',
      });

      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
        sessionVersion: 3,
      });
      expect(result.accessToken).toBe('jwt-token');
      expect(result.user).not.toHaveProperty('passwordHash');
    });

    it('should reset failed-login state on success', async () => {
      usersService.findByEmail.mockResolvedValue({
        ...user,
        failedLoginAttempts: 2,
        loginBlockedUntil: new Date('2026-01-01'),
      });
      passwordService.compare.mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue('token');

      await service.login({ email: 'user@test.com', password: 'secret123' });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: user.id },
        data: {
          failedLoginAttempts: 0,
          loginBlockedUntil: null,
          lastFailedLoginAt: null,
        },
      });
    });

    it('should reject a wrong password and increment failed attempts', async () => {
      usersService.findByEmail.mockResolvedValue(user);
      passwordService.compare.mockResolvedValue(false);
      config.get.mockImplementation((key: string) =>
        key === 'LOGIN_MAX_ATTEMPTS' ? 5 : undefined,
      );

      await expect(
        service.login({ email: 'user@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: user.id },
        data: {
          failedLoginAttempts: 1,
          lastFailedLoginAt: ANY_DATE,
        },
      });
    });

    it('should activate temporary protection at the threshold', async () => {
      usersService.findByEmail.mockResolvedValue({
        ...user,
        failedLoginAttempts: 4,
      });
      passwordService.compare.mockResolvedValue(false);
      config.get.mockImplementation((key: string) =>
        key === 'LOGIN_MAX_ATTEMPTS'
          ? 5
          : key === 'LOGIN_BLOCK_DURATION_MS'
            ? 60000
            : undefined,
      );

      await expect(
        service.login({ email: 'user@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: user.id },
        data: {
          failedLoginAttempts: 5,
          lastFailedLoginAt: ANY_DATE,
          loginBlockedUntil: ANY_DATE,
        },
      });
      expect(securityAudit.record).toHaveBeenCalledWith(
        user.id,
        SecurityAction.LOGIN_TEMPORARILY_BLOCKED,
      );
    });

    it('should deny login while temporary protection is active', async () => {
      usersService.findByEmail.mockResolvedValue({
        ...user,
        loginBlockedUntil: new Date(Date.now() + 60_000),
      });
      passwordService.compare.mockResolvedValue(true);

      await expect(
        service.login({ email: 'user@test.com', password: 'secret123' }),
      ).rejects.toThrow(UnauthorizedException);
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should reject login for an unknown email without distinguishing it', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      passwordService.compare.mockResolvedValue(false);

      await expect(
        service.login({ email: 'missing@test.com', password: 'secret123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should reject login for a disabled account', async () => {
      usersService.findByEmail.mockResolvedValue({
        ...user,
        status: AccountStatus.DISABLED,
      });

      await expect(
        service.login({ email: 'user@test.com', password: 'secret123' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('changePassword', () => {
    it('changes the password and increments sessionVersion', async () => {
      prisma.user.findUnique.mockResolvedValue(user);
      passwordService.compare.mockResolvedValue(true);
      passwordService.hash.mockResolvedValue('$2b$10$new-hash');

      const result = await service.changePassword(user.id, {
        currentPassword: 'old-password',
        newPassword: 'new-secret',
      });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: user.id },
        data: {
          passwordHash: '$2b$10$new-hash',
          sessionVersion: { increment: 1 },
        },
      });
      expect(prisma.securityAuditEvent.create).toHaveBeenCalledWith({
        data: { userId: user.id, action: SecurityAction.PASSWORD_CHANGED },
      });
      expect(result).toEqual({ success: true });
    });

    it('rejects an incorrect current password', async () => {
      prisma.user.findUnique.mockResolvedValue(user);
      passwordService.compare.mockResolvedValue(false);

      await expect(
        service.changePassword(user.id, {
          currentPassword: 'wrong',
          newPassword: 'new-secret',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('rejects a new password that violates the policy', async () => {
      prisma.user.findUnique.mockResolvedValue(user);
      passwordService.compare.mockResolvedValue(true);
      passwordPolicy.validate.mockReturnValue({
        valid: false,
        message: 'Senha muito curta.',
      });

      await expect(
        service.changePassword(user.id, {
          currentPassword: 'old-password',
          newPassword: 'short',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('logoutAll', () => {
    it('increments sessionVersion and records an audit event', async () => {
      const result = await service.logoutAll(user.id);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: user.id },
        data: { sessionVersion: { increment: 1 } },
      });
      expect(prisma.securityAuditEvent.create).toHaveBeenCalledWith({
        data: { userId: user.id, action: SecurityAction.LOGOUT_ALL_SESSIONS },
      });
      expect(result).toEqual({ success: true });
    });
  });

  describe('forgotPassword', () => {
    it('returns a generic message and creates a token for an eligible account', async () => {
      prisma.user.findUnique.mockResolvedValue(user);
      passwordReset.createToken.mockResolvedValue({
        rawToken: 'raw-token',
        expiresAt: new Date('2026-02-01'),
      });

      const result = await service.forgotPassword({ email: 'user@test.com' });

      expect(passwordReset.createToken).toHaveBeenCalledWith(user.id);
      expect(mailService.sendPasswordReset).toHaveBeenCalledWith(
        expect.objectContaining({ to: 'user@test.com', token: 'raw-token' }),
      );
      expect(result.message).toContain('Se uma conta existir');
    });

    it('returns the same generic message for an unknown email', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await service.forgotPassword({
        email: 'missing@test.com',
      });

      expect(passwordReset.createToken).not.toHaveBeenCalled();
      expect(mailService.sendPasswordReset).not.toHaveBeenCalled();
      expect(result.message).toContain('Se uma conta existir');
    });

    it('never creates a token for a hidden SUPER_ADMIN account', async () => {
      prisma.user.findUnique.mockResolvedValue({
        ...user,
        email: 'hidden@system.com',
        roles: [{ userId: user.id, role: Role.SUPER_ADMIN }],
      });

      const result = await service.forgotPassword({
        email: 'hidden@system.com',
      });

      expect(passwordReset.createToken).not.toHaveBeenCalled();
      expect(result.message).toContain('Se uma conta existir');
    });
  });

  describe('resetPassword', () => {
    it('resets the password transactionally and invalidates other tokens', async () => {
      const record = {
        id: 'reset-1',
        userId: user.id,
        tokenHash: 'hash',
        expiresAt: new Date(Date.now() + 60_000),
        usedAt: null,
      };
      passwordReset.findValidByRawToken.mockResolvedValue(record);
      passwordService.hash.mockResolvedValue('$2b$10$new-hash');

      const result = await service.resetPassword({
        token: 'raw-token',
        newPassword: 'new-secret',
      });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: user.id },
        data: {
          passwordHash: '$2b$10$new-hash',
          sessionVersion: { increment: 1 },
          failedLoginAttempts: 0,
          loginBlockedUntil: null,
          lastFailedLoginAt: null,
        },
      });
      expect(prisma.passwordResetToken.update).toHaveBeenCalledWith({
        where: { id: 'reset-1' },
        data: { usedAt: ANY_DATE },
      });
      expect(prisma.passwordResetToken.updateMany).toHaveBeenCalledWith({
        where: { userId: user.id, usedAt: null },
        data: { usedAt: ANY_DATE },
      });
      expect(prisma.securityAuditEvent.create).toHaveBeenCalledWith({
        data: {
          userId: user.id,
          action: SecurityAction.PASSWORD_RESET_COMPLETED,
        },
      });
      expect(result).toEqual({ success: true });
    });

    it('rejects an expired token', async () => {
      passwordReset.findValidByRawToken.mockResolvedValue({
        id: 'reset-1',
        userId: user.id,
        tokenHash: 'hash',
        expiresAt: new Date(Date.now() - 1000),
        usedAt: null,
      });

      await expect(
        service.resetPassword({ token: 'raw', newPassword: 'new-secret' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('rejects an already-used token', async () => {
      passwordReset.findValidByRawToken.mockResolvedValue({
        id: 'reset-1',
        userId: user.id,
        tokenHash: 'hash',
        expiresAt: new Date(Date.now() + 60_000),
        usedAt: new Date(),
      });

      await expect(
        service.resetPassword({ token: 'raw', newPassword: 'new-secret' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('rejects a missing token', async () => {
      passwordReset.findValidByRawToken.mockResolvedValue(null);

      await expect(
        service.resetPassword({ token: 'raw', newPassword: 'new-secret' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
