import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { AccountStatus, Role, User } from '@prisma/client';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

type UserWithRoles = User & {
  roles: { role: Role }[];
  tier: { id: string; name: string; priority: number } | null;
};

const makeUser = (
  overrides: Partial<Omit<UserWithRoles, 'roles' | 'tier'>> & {
    roles?: { role: Role }[];
    tier?: UserWithRoles['tier'];
  } = {},
): UserWithRoles => ({
  id: 'uuid-1',
  email: 'user@test.com',
  passwordHash: '$2b$10$hashed-value',
  name: 'User Name',
  status: AccountStatus.ACTIVE,
  roles: [{ role: Role.SUBSCRIBER }],
  tierId: null,
  tier: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  ...overrides,
});

describe('UsersService', () => {
  let service: UsersService;
  let prisma: {
    user: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    userRole: {
      upsert: jest.Mock;
      delete: jest.Mock;
    };
    tier: {
      findUnique: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      user: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      userRole: {
        upsert: jest.fn(),
        delete: jest.fn(),
      },
      tier: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('create', () => {
    it('should create a user profile and sanitize the result', async () => {
      const user = makeUser();
      prisma.user.create.mockResolvedValue(user);

      const result = await service.create({
        email: 'user@test.com',
        passwordHash: '$2b$10$hashed-value',
        name: 'User Name',
      });

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'user@test.com',
          passwordHash: '$2b$10$hashed-value',
          name: 'User Name',
          roles: { create: [{ role: Role.SUBSCRIBER }] },
        },
        include: { roles: true, tier: true },
      });
      expect(result).toEqual({
        id: user.id,
        email: user.email,
        name: user.name,
        status: user.status,
        roles: [Role.SUBSCRIBER],
        tierId: null,
        tier: null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should assign the requested roles when provided', async () => {
      prisma.user.create.mockResolvedValue(
        makeUser({ roles: [{ role: Role.SUPER_ADMIN }] }),
      );

      const expectedData = {
        email: 'user@test.com',
        passwordHash: '$2b$10$hashed-value',
        roles: { create: [{ role: Role.SUPER_ADMIN }] },
      };

      await service.create({
        email: 'user@test.com',
        passwordHash: '$2b$10$hashed-value',
        roles: [Role.SUPER_ADMIN],
      });

      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expectedData,
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return all users ordered by creation date', async () => {
      const users = [makeUser({ id: 'uuid-1' }), makeUser({ id: 'uuid-2' })];
      prisma.user.findMany.mockResolvedValue(users);

      const result = await service.findAll();

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        include: { roles: true, tier: true },
        orderBy: { createdAt: 'asc' },
      });
      expect(result).toHaveLength(2);
      expect(result[0]).not.toHaveProperty('passwordHash');
    });
  });

  describe('findOne', () => {
    it('should return a sanitized user profile when it exists', async () => {
      const user = makeUser();
      prisma.user.findUnique.mockResolvedValue(user);

      const result = await service.findOne('uuid-1');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        include: { roles: true, tier: true },
      });
      expect(result?.email).toBe('user@test.com');
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should return null when the user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne('missing')).resolves.toBeNull();
    });
  });

  describe('getProfile', () => {
    it('should return the user profile when it exists', async () => {
      const user = makeUser();
      prisma.user.findUnique.mockResolvedValue(user);

      const result = await service.getProfile('uuid-1');

      expect(result?.id).toBe('uuid-1');
    });

    it('should throw NotFoundException when the user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getProfile('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('assignRole', () => {
    it('should assign a role to an existing user', async () => {
      prisma.user.findUnique.mockResolvedValue(makeUser());
      prisma.userRole.upsert.mockResolvedValue({
        userId: 'uuid-1',
        role: Role.ARTIST,
      });
      prisma.user.findUnique.mockResolvedValue(
        makeUser({ roles: [{ role: Role.SUBSCRIBER }, { role: Role.ARTIST }] }),
      );

      const result = await service.assignRole('uuid-1', Role.ARTIST);

      expect(prisma.userRole.upsert).toHaveBeenCalledWith({
        where: { userId_role: { userId: 'uuid-1', role: Role.ARTIST } },
        create: { userId: 'uuid-1', role: Role.ARTIST },
        update: {},
      });
      expect(result?.roles).toContain(Role.ARTIST);
    });

    it('should throw NotFoundException when the user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.assignRole('missing', Role.ARTIST)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('removeRole', () => {
    it('should remove a role from an existing user', async () => {
      prisma.user.findUnique.mockResolvedValue(makeUser());
      prisma.userRole.delete.mockResolvedValue({
        userId: 'uuid-1',
        role: Role.ARTIST,
      });
      prisma.user.findUnique.mockResolvedValue(makeUser());

      const result = await service.removeRole('uuid-1', Role.ARTIST);

      expect(prisma.userRole.delete).toHaveBeenCalledWith({
        where: { userId_role: { userId: 'uuid-1', role: Role.ARTIST } },
      });
      expect(result?.roles).not.toContain(Role.ARTIST);
    });

    it('should throw ConflictException when the role is not assigned', async () => {
      prisma.user.findUnique.mockResolvedValue(makeUser());
      prisma.userRole.delete.mockRejectedValue(new Error('not found'));

      await expect(service.removeRole('uuid-1', Role.ARTIST)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw NotFoundException when the user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.removeRole('missing', Role.ARTIST)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('setStatus', () => {
    it('should update the account status', async () => {
      prisma.user.update.mockResolvedValue(
        makeUser({ status: AccountStatus.DISABLED }),
      );

      const result = await service.setStatus('uuid-1', AccountStatus.DISABLED);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        data: { status: AccountStatus.DISABLED },
        include: { roles: true, tier: true },
      });
      expect(result.status).toBe(AccountStatus.DISABLED);
    });

    it('should reactivate an account', async () => {
      prisma.user.update.mockResolvedValue(
        makeUser({ status: AccountStatus.ACTIVE }),
      );

      const result = await service.setStatus('uuid-1', AccountStatus.ACTIVE);

      expect(result.status).toBe(AccountStatus.ACTIVE);
    });
  });

  describe('update', () => {
    it('should update user information and sanitize the result', async () => {
      const updated = makeUser({ name: 'New Name' });
      prisma.user.update.mockResolvedValue(updated);

      const result = await service.update('uuid-1', { name: 'New Name' });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        data: { name: 'New Name' },
        include: { roles: true, tier: true },
      });
      expect(result.name).toBe('New Name');
      expect(result).not.toHaveProperty('passwordHash');
    });
  });

  describe('assignTier', () => {
    it('should assign a tier to an existing user', async () => {
      prisma.user.findUnique.mockResolvedValue(makeUser());
      prisma.tier.findUnique.mockResolvedValue({
        id: 'tier-1',
        name: 'Premium',
        priority: 1,
      });
      prisma.user.update.mockResolvedValue(
        makeUser({
          tierId: 'tier-1',
          tier: { id: 'tier-1', name: 'Premium', priority: 1 },
        }),
      );

      const result = await service.assignTier('uuid-1', 'tier-1');

      expect(prisma.tier.findUnique).toHaveBeenCalledWith({
        where: { id: 'tier-1' },
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        data: { tierId: 'tier-1' },
        include: { roles: true, tier: true },
      });
      expect(result?.tier?.name).toBe('Premium');
    });

    it('should throw BadRequestException when the tier does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(makeUser());
      prisma.tier.findUnique.mockResolvedValue(null);

      await expect(service.assignTier('uuid-1', 'missing')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should clear the tier when tierId is null', async () => {
      prisma.user.findUnique.mockResolvedValue(makeUser());
      prisma.user.update.mockResolvedValue(makeUser());

      const result = await service.assignTier('uuid-1', null);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        data: { tierId: null },
        include: { roles: true, tier: true },
      });
      expect(result?.tier).toBeNull();
    });

    it('should throw NotFoundException when the user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.assignTier('missing', 'tier-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a user and return the sanitized result', async () => {
      const user = makeUser();
      prisma.user.delete.mockResolvedValue(user);

      const result = await service.remove('uuid-1');

      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        include: { roles: true, tier: true },
      });
      expect(result).not.toHaveProperty('passwordHash');
    });
  });
});
