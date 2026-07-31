import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
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
    role: Role.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
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
      usersService.create.mockResolvedValue(user);

      const result = await service.register({
        email: 'user@test.com',
        password: 'secret123',
      });

      expect(passwordService.hash).toHaveBeenCalledWith('secret123');
      expect(usersService.create).toHaveBeenCalledWith({
        email: 'user@test.com',
        passwordHash: '$2b$10$hashed-value',
        role: Role.USER,
      });
      expect(result.email).toBe('user@test.com');
    });

    it('should not include the password hash in the response', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      passwordService.hash.mockResolvedValue('$2b$10$hashed-value');
      usersService.create.mockResolvedValue(user);

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

    it('should default role to USER when not provided', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      passwordService.hash.mockResolvedValue('$2b$10$hashed-value');
      usersService.create.mockResolvedValue(user);

      await service.register({
        email: 'user@test.com',
        password: 'secret123',
      });

      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({ role: Role.USER }),
      );
    });

    it('should preserve the provided role', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      passwordService.hash.mockResolvedValue('$2b$10$hashed-value');
      usersService.create.mockResolvedValue({ ...user, role: Role.ARTIST });

      const result = await service.register({
        email: 'user@test.com',
        password: 'secret123',
        role: Role.ARTIST,
      });

      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({ role: Role.ARTIST }),
      );
      expect(result.role).toBe(Role.ARTIST);
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
        role: user.role,
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
  });

  describe('validateUser', () => {
    it('should return sanitized user when credentials are valid', async () => {
      usersService.findByEmail.mockResolvedValue(user);
      passwordService.compare.mockResolvedValue(true);

      const result = await service.validateUser('user@test.com', 'secret123');

      expect(result).toEqual({
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
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
  });
});
