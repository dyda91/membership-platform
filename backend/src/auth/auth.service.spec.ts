import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AccountStatus, Role } from '@prisma/client';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { PasswordService } from './password.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: { findByEmail: jest.Mock; create: jest.Mock };
  let passwordService: { hash: jest.Mock; compare: jest.Mock };
  let jwtService: { signAsync: jest.Mock };

  const user = {
    id: 'uuid-1',
    email: 'user@test.com',
    passwordHash: '$2b$10$hashed-value',
    name: null,
    status: AccountStatus.ACTIVE,
    roles: [{ userId: 'uuid-1', role: Role.SUBSCRIBER }],
    tier: null,
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

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    };
    passwordService = {
      hash: jest.fn(),
      compare: jest.fn(),
    };
    jwtService = {
      signAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: PasswordService, useValue: passwordService },
        { provide: JwtService, useValue: jwtService },
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

    it('should pass through the optional name field', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      passwordService.hash.mockResolvedValue('$2b$10$hashed-value');
      usersService.create.mockResolvedValue(safeUser);

      await service.register({
        name: 'New Subscriber',
        email: 'user@test.com',
        password: 'secret123',
      });

      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'New Subscriber' }),
      );
    });

    it('must not propagate any role or tier through public registration', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      passwordService.hash.mockResolvedValue('$2b$10$hashed-value');
      usersService.create.mockResolvedValue(safeUser);

      // Extra privileged properties are typed away at compile time; the DTO
      // allowlist and whitelist validation pipe strip them before reaching here.
      await service.register({
        email: 'user@test.com',
        password: 'secret123',
      });

      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'user@test.com',
          passwordHash: '$2b$10$hashed-value',
        }),
      );
      const firstCallArgs = usersService.create.mock.calls.at(0) as
        [Record<string, unknown>] | undefined;

      expect(firstCallArgs?.[0].roles).toBeUndefined();
      expect(firstCallArgs?.[0].tierId).toBeUndefined();
    });

    it('should not include the password hash in the response', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      passwordService.hash.mockResolvedValue('$2b$10$hashed-value');
      usersService.create.mockResolvedValue(safeUser);

      const result = await service.register({
        email: 'user@test.com',
        password: 'secret123',
      });

      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should reject registration when email is already registered', async () => {
      usersService.findByEmail.mockResolvedValue(user);

      await expect(
        service.register({ email: 'user@test.com', password: 'secret123' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should let the users service assign the default role', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      passwordService.hash.mockResolvedValue('$2b$10$hashed-value');
      usersService.create.mockResolvedValue(safeUser);

      await service.register({
        email: 'user@test.com',
        password: 'secret123',
      });

      expect(usersService.create).toHaveBeenCalledWith({
        email: 'user@test.com',
        passwordHash: '$2b$10$hashed-value',
      });
    });
  });

  describe('login', () => {
    it('should return a token and sanitized user when credentials are valid', async () => {
      usersService.findByEmail.mockResolvedValue(user);
      passwordService.compare.mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue('jwt-token');

      const result = await service.login({
        email: 'user@test.com',
        password: 'secret123',
      });

      expect(passwordService.compare).toHaveBeenCalledWith(
        'secret123',
        user.passwordHash,
      );
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
        roles: [Role.SUBSCRIBER],
      });
      expect(result.accessToken).toBe('jwt-token');
      expect(result.user.email).toBe('user@test.com');
      expect(result.user).not.toHaveProperty('passwordHash');
    });

    it('should reject login when password is invalid', async () => {
      usersService.findByEmail.mockResolvedValue(user);
      passwordService.compare.mockResolvedValue(false);

      await expect(
        service.login({ email: 'user@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should reject login when user does not exist', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'missing@test.com', password: 'secret123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should reject login when the account is disabled', async () => {
      usersService.findByEmail.mockResolvedValue({
        ...user,
        status: AccountStatus.DISABLED,
      });

      await expect(
        service.login({ email: 'user@test.com', password: 'secret123' }),
      ).rejects.toThrow(UnauthorizedException);
      expect(passwordService.compare).not.toHaveBeenCalled();
    });
  });

  describe('validateUser', () => {
    it('should return sanitized user when credentials are valid', async () => {
      usersService.findByEmail.mockResolvedValue(user);
      passwordService.compare.mockResolvedValue(true);

      const result = await service.validateUser('user@test.com', 'secret123');

      expect(result).toEqual(safeUser);
    });

    it('should return null when password is invalid', async () => {
      usersService.findByEmail.mockResolvedValue(user);
      passwordService.compare.mockResolvedValue(false);

      const result = await service.validateUser('user@test.com', 'wrong');

      expect(result).toBeNull();
    });

    it('should return null when user does not exist', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser(
        'missing@test.com',
        'secret123',
      );

      expect(result).toBeNull();
    });

    it('should return null when the account is disabled', async () => {
      usersService.findByEmail.mockResolvedValue({
        ...user,
        status: AccountStatus.DISABLED,
      });

      const result = await service.validateUser('user@test.com', 'secret123');

      expect(result).toBeNull();
    });
  });
});
