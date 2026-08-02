import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { AccountStatus, Role, User } from '@prisma/client';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

type UserWithRelations = User & {
  roles: { role: Role }[];
  tier: { id: string; name: string; priority: number } | null;
  tierAssignments: {
    id: string;
    tierId: string;
    startsAt: Date;
    expiresAt: Date | null;
    revokedAt: Date | null;
    tier: { id: string; name: string; priority: number } | null;
  }[];
};

const makeUser = (
  overrides: Partial<
    Omit<UserWithRelations, 'roles' | 'tier' | 'tierAssignments'>
  > & {
    roles?: { role: Role }[];
    tier?: UserWithRelations['tier'];
    tierAssignments?: UserWithRelations['tierAssignments'];
  } = {},
): UserWithRelations => ({
  id: 'uuid-1',
  email: 'user@test.com',
  passwordHash: '$2b$10$hashed-value',
  name: 'User Name',
  status: AccountStatus.ACTIVE,
  roles: [{ role: Role.SUBSCRIBER }],
  tierId: null,
  tier: null,
  tierAssignments: [],
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  ...overrides,
});

const artistActor = { id: 'artist-1', roles: [Role.ARTIST] };
const superAdminActor = { id: 'root-1', roles: [Role.SUPER_ADMIN] };

describe('UsersService', () => {
  let service: UsersService;
  let prisma: {
    user: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      count: jest.Mock;
    };
    userRole: {
      upsert: jest.Mock;
      delete: jest.Mock;
      deleteMany: jest.Mock;
    };
    tier: {
      findUnique: jest.Mock;
    };
    artist: {
      upsert: jest.Mock;
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      user: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      userRole: {
        upsert: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
      },
      tier: {
        findUnique: jest.fn(),
      },
      artist: {
        upsert: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      $transaction: jest.fn(),
    };
    prisma.$transaction.mockImplementation(((operation: unknown) => {
      if (typeof operation === 'function') {
        return (operation as (tx: typeof prisma) => unknown)(prisma);
      }

      if (Array.isArray(operation)) {
        return Promise.all(operation as Promise<unknown>[]);
      }

      return undefined;
    }) as never);

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
        include: {
          roles: true,
          tier: true,
          tierAssignments: { include: { tier: true } },
        },
      });
      expect(result).not.toHaveProperty('passwordHash');
    });
  });

  describe('findAll', () => {
    it('should exclude hidden SUPER_ADMIN accounts and return pagination metadata', async () => {
      prisma.user.findMany.mockResolvedValue([makeUser()]);
      prisma.user.count.mockResolvedValue(1);

      const result = await service.findAll();

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { roles: { none: { role: Role.SUPER_ADMIN } } },
          skip: 0,
          take: 20,
        }),
      );
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
      expect(result.data).toHaveLength(1);
    });

    it('should search by name or email case-insensitively', async () => {
      prisma.user.findMany.mockResolvedValue([]);
      prisma.user.count.mockResolvedValue(0);

      await service.findAll({ search: '  maria  ' });

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            roles: { none: { role: Role.SUPER_ADMIN } },
            OR: [
              { name: { contains: 'maria', mode: 'insensitive' } },
              { email: { contains: 'maria', mode: 'insensitive' } },
            ],
          },
        }),
      );
    });

    it('should filter by tier and status together with search', async () => {
      prisma.user.findMany.mockResolvedValue([]);
      prisma.user.count.mockResolvedValue(0);

      await service.findAll({
        search: 'jo',
        tierId: 'tier-1',
        status: AccountStatus.ACTIVE,
      });

      const where = { tierId: 'tier-1', status: AccountStatus.ACTIVE };
      const callArgs = prisma.user.findMany.mock.calls.at(0) as
        [{ where: unknown }] | undefined;

      expect(callArgs?.[0]?.where).toMatchObject(where);
    });

    it('should filter by a permitted role but never SUPER_ADMIN', async () => {
      prisma.user.findMany.mockResolvedValue([]);
      prisma.user.count.mockResolvedValue(0);

      await service.findAll({ role: Role.SUBSCRIBER });

      const where = { roles: { some: { role: Role.SUBSCRIBER } } };
      const callArgs = prisma.user.findMany.mock.calls.at(0) as
        [{ where: unknown }] | undefined;

      expect(callArgs?.[0]?.where).toMatchObject(where);
    });

    it('should handle a page beyond available results safely', async () => {
      prisma.user.findMany.mockResolvedValue([]);
      prisma.user.count.mockResolvedValue(5);

      const result = await service.findAll({ page: 99, limit: 20 });

      expect(result.data).toEqual([]);
      expect(result.page).toBe(99);
      expect(result.totalPages).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a user for the artist when the target is not hidden', async () => {
      prisma.user.findUnique.mockResolvedValue(makeUser());

      const result = await service.findOne('uuid-1', artistActor);

      expect(result?.email).toBe('user@test.com');
    });

    it('should hide SUPER_ADMIN accounts from the artist', async () => {
      prisma.user.findUnique.mockResolvedValue(
        makeUser({
          roles: [{ role: Role.SUPER_ADMIN }],
        }),
      );

      const result = await service.findOne('root-1', artistActor);

      expect(result).toBeNull();
    });

    it('should return SUPER_ADMIN account for a SUPER_ADMIN actor', async () => {
      prisma.user.findUnique.mockResolvedValue(
        makeUser({
          roles: [{ role: Role.SUPER_ADMIN }],
        }),
      );

      const result = await service.findOne('root-1', superAdminActor);

      expect(result?.roles).toContain(Role.SUPER_ADMIN);
    });
  });

  describe('assignRole', () => {
    it('should allow SUPER_ADMIN to assign the ARTIST role', async () => {
      prisma.user.findUnique.mockResolvedValue(makeUser());
      prisma.userRole.upsert.mockResolvedValue({
        userId: 'uuid-1',
        role: Role.ARTIST,
      });
      prisma.user.findUnique.mockResolvedValue(
        makeUser({ roles: [{ role: Role.ARTIST }] }),
      );

      const result = await service.assignRole(
        'uuid-1',
        Role.ARTIST,
        superAdminActor,
      );

      expect(prisma.userRole.upsert).toHaveBeenCalledWith({
        where: { userId_role: { userId: 'uuid-1', role: Role.ARTIST } },
        create: { userId: 'uuid-1', role: Role.ARTIST },
        update: {},
      });
      expect(result?.roles).toContain(Role.ARTIST);
    });

    it('should prevent ARTIST from assigning the ARTIST role', async () => {
      prisma.user.findUnique.mockResolvedValue(makeUser());

      await expect(
        service.assignRole('uuid-1', Role.ARTIST, artistActor),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should prevent ARTIST from assigning the SUPER_ADMIN role', async () => {
      prisma.user.findUnique.mockResolvedValue(makeUser());

      await expect(
        service.assignRole('uuid-1', Role.SUPER_ADMIN, artistActor),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should prevent assigning SUPER_ADMIN even for SUPER_ADMIN actors', async () => {
      prisma.user.findUnique.mockResolvedValue(makeUser());

      await expect(
        service.assignRole('uuid-1', Role.SUPER_ADMIN, superAdminActor),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should prevent assigning a role to a hidden SUPER_ADMIN target', async () => {
      prisma.user.findUnique.mockResolvedValue(
        makeUser({ roles: [{ role: Role.SUPER_ADMIN }] }),
      );

      await expect(
        service.assignRole('root-1', Role.ARTIST, artistActor),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeRole', () => {
    it('should remove a role from a non-hidden user', async () => {
      prisma.user.findUnique.mockResolvedValue(makeUser());
      prisma.userRole.delete.mockResolvedValue({
        userId: 'uuid-1',
        role: Role.ARTIST,
      });
      prisma.user.findUnique.mockResolvedValue(makeUser());

      const result = await service.removeRole(
        'uuid-1',
        Role.ARTIST,
        artistActor,
      );

      expect(result?.roles).not.toContain(Role.ARTIST);
    });

    it('should throw ConflictException when the role is not assigned', async () => {
      prisma.user.findUnique.mockResolvedValue(makeUser());
      prisma.userRole.delete.mockRejectedValue(new Error('not found'));

      await expect(
        service.removeRole('uuid-1', Role.ARTIST, artistActor),
      ).rejects.toThrow(ConflictException);
    });

    it('should hide SUPER_ADMIN targets from removal', async () => {
      prisma.user.findUnique.mockResolvedValue(
        makeUser({ roles: [{ role: Role.SUPER_ADMIN }] }),
      );

      await expect(
        service.removeRole('root-1', Role.ARTIST, artistActor),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('setStatus', () => {
    it('should update the account status', async () => {
      prisma.user.findUnique.mockResolvedValue(makeUser());
      prisma.user.update.mockResolvedValue(
        makeUser({ status: AccountStatus.DISABLED }),
      );

      const result = await service.setStatus(
        'uuid-1',
        AccountStatus.DISABLED,
        artistActor,
      );

      expect(result.status).toBe(AccountStatus.DISABLED);
    });

    it('should prevent deactivating a hidden SUPER_ADMIN by the artist', async () => {
      prisma.user.findUnique.mockResolvedValue(
        makeUser({ roles: [{ role: Role.SUPER_ADMIN }] }),
      );

      await expect(
        service.setStatus('root-1', AccountStatus.DISABLED, artistActor),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('assignTier', () => {
    it('should allow the artist to assign a tier to an eligible member', async () => {
      prisma.user.findUnique.mockResolvedValue(makeUser());
      prisma.tier.findUnique.mockResolvedValue({
        id: 'tier-1',
        name: 'Gold',
        priority: 3,
      });
      prisma.user.update.mockResolvedValue(
        makeUser({
          tierId: 'tier-1',
          tier: { id: 'tier-1', name: 'Gold', priority: 3 },
        }),
      );

      const result = await service.assignTier('uuid-1', 'tier-1', artistActor);

      expect(result?.tier?.name).toBe('Gold');
    });

    it('should throw BadRequestException when the tier does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(makeUser());
      prisma.tier.findUnique.mockResolvedValue(null);

      await expect(
        service.assignTier('uuid-1', 'missing', artistActor),
      ).rejects.toThrow(BadRequestException);
    });

    it('should prevent assigning a tier to a hidden SUPER_ADMIN', async () => {
      prisma.user.findUnique.mockResolvedValue(
        makeUser({ roles: [{ role: Role.SUPER_ADMIN }] }),
      );

      await expect(
        service.assignTier('root-1', 'tier-1', artistActor),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateOwnProfile', () => {
    it('should allow a subscriber to update only the permitted name field', async () => {
      prisma.user.findUnique.mockResolvedValue(makeUser());
      prisma.user.update.mockResolvedValue(makeUser({ name: 'New Name' }));

      const result = await service.updateOwnProfile('uuid-1', {
        name: 'New Name',
      });

      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'uuid-1' },
          data: { name: 'New Name' },
        }),
      );
      expect(result.name).toBe('New Name');
    });
  });

  describe('remove', () => {
    it('should delete a non-hidden user', async () => {
      prisma.user.findUnique.mockResolvedValue(makeUser());
      prisma.user.delete.mockResolvedValue(makeUser());

      const result = await service.remove('uuid-1', artistActor);

      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should prevent deleting a hidden SUPER_ADMIN by the artist', async () => {
      prisma.user.findUnique.mockResolvedValue(
        makeUser({ roles: [{ role: Role.SUPER_ADMIN }] }),
      );

      await expect(service.remove('root-1', artistActor)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('promoteToArtist', () => {
    it('allows SUPER_ADMIN to promote an eligible subscriber', async () => {
      prisma.user.findUnique.mockResolvedValue(makeUser());
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.userRole.upsert.mockResolvedValue({
        userId: 'uuid-1',
        role: Role.ARTIST,
      });
      prisma.user.findUnique.mockResolvedValue(
        makeUser({ roles: [{ role: Role.ARTIST }] }),
      );

      const result = await service.promoteToArtist('uuid-1', superAdminActor);

      expect(result?.roles).toContain(Role.ARTIST);
    });

    it('prevents promotion when another active artist exists', async () => {
      prisma.user.findUnique.mockResolvedValue(makeUser());
      prisma.user.findFirst.mockResolvedValue({ id: 'artist-1' });

      await expect(
        service.promoteToArtist('uuid-1', superAdminActor),
      ).rejects.toThrow(ConflictException);
    });

    it('prevents ARTIST from promoting', async () => {
      prisma.user.findUnique.mockResolvedValue(makeUser());

      await expect(
        service.promoteToArtist('uuid-1', artistActor),
      ).rejects.toThrow(ForbiddenException);
    });

    it('prevents hidden SUPER_ADMIN accounts from becoming artists', async () => {
      prisma.user.findUnique.mockResolvedValue(
        makeUser({ roles: [{ role: Role.SUPER_ADMIN }] }),
      );

      await expect(
        service.promoteToArtist('root-1', superAdminActor),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('replaceArtist', () => {
    it('atomically replaces the active artist and preserves one artist', async () => {
      prisma.user.findUnique
        .mockResolvedValueOnce(
          makeUser({ id: 'replacement-1', roles: [{ role: Role.SUBSCRIBER }] }),
        )
        .mockResolvedValueOnce(
          makeUser({ id: 'replacement-1', roles: [{ role: Role.ARTIST }] }),
        );
      prisma.user.findFirst.mockResolvedValue(
        makeUser({ id: 'old-artist', roles: [{ role: Role.ARTIST }] }),
      );
      prisma.userRole.deleteMany.mockResolvedValue({ count: 1 });
      prisma.userRole.upsert.mockResolvedValue({
        userId: 'replacement-1',
        role: Role.ARTIST,
      });

      const result = await service.replaceArtist(
        'replacement-1',
        superAdminActor,
      );

      expect(prisma.userRole.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'old-artist', role: Role.ARTIST },
      });
      expect(prisma.userRole.upsert).toHaveBeenCalledWith({
        where: { userId_role: { userId: 'replacement-1', role: Role.ARTIST } },
        create: { userId: 'replacement-1', role: Role.ARTIST },
        update: {},
      });
      expect(result?.roles).toContain(Role.ARTIST);
    });

    it('prevents ARTIST from replacing the artist', async () => {
      prisma.user.findUnique.mockResolvedValue(makeUser());

      await expect(
        service.replaceArtist('uuid-1', artistActor),
      ).rejects.toThrow(ForbiddenException);
    });

    it('rejects a hidden replacement target', async () => {
      prisma.user.findUnique.mockResolvedValue(
        makeUser({ roles: [{ role: Role.SUPER_ADMIN }] }),
      );

      await expect(
        service.replaceArtist('root-1', superAdminActor),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects an already-artist replacement target', async () => {
      prisma.user.findUnique.mockResolvedValue(
        makeUser({ roles: [{ role: Role.ARTIST }] }),
      );

      await expect(
        service.replaceArtist('uuid-1', superAdminActor),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('getArtistCandidates', () => {
    it('excludes SUPER_ADMIN, ARTIST and inactive accounts', async () => {
      prisma.user.findMany.mockResolvedValue([makeUser()]);

      const result = await service.getArtistCandidates();

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            status: AccountStatus.ACTIVE,
            roles: { none: { role: { in: [Role.SUPER_ADMIN, Role.ARTIST] } } },
          },
        }),
      );
      expect(result).toHaveLength(1);
    });
  });
});
