import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { TiersService } from './tiers.service';
import { PrismaService } from '../prisma/prisma.service';

const makeTier = (overrides: Record<string, unknown> = {}) => ({
  id: 'tier-1',
  name: 'Free',
  description: 'Free tier',
  priority: 0,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  ...overrides,
});

describe('TiersService', () => {
  let service: TiersService;
  let prisma: {
    tier: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      tier: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [TiersService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<TiersService>(TiersService);
  });

  describe('create', () => {
    it('should create a tier', async () => {
      const tier = makeTier();
      prisma.tier.create.mockResolvedValue(tier);

      const result = await service.create({
        name: 'Free',
        description: 'Free tier',
      });

      expect(prisma.tier.create).toHaveBeenCalledWith({
        data: { name: 'Free', description: 'Free tier' },
      });
      expect(result.name).toBe('Free');
    });

    it('should throw ConflictException when the name is duplicated', async () => {
      prisma.tier.create.mockRejectedValue(new Error('unique violation'));

      await expect(
        service.create({ name: 'Free', description: 'Free tier' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return tiers ordered by priority', async () => {
      prisma.tier.findMany.mockResolvedValue([
        makeTier(),
        makeTier({ priority: 1 }),
      ]);

      const result = await service.findAll();

      expect(prisma.tier.findMany).toHaveBeenCalledWith({
        orderBy: { priority: 'asc' },
      });
      expect(result).toHaveLength(2);
    });
  });

  describe('findOne', () => {
    it('should return a tier when it exists', async () => {
      prisma.tier.findUnique.mockResolvedValue(makeTier());

      const result = await service.findOne('tier-1');

      expect(prisma.tier.findUnique).toHaveBeenCalledWith({
        where: { id: 'tier-1' },
      });
      expect(result?.id).toBe('tier-1');
    });

    it('should throw NotFoundException when the tier does not exist', async () => {
      prisma.tier.findUnique.mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a tier', async () => {
      prisma.tier.findUnique.mockResolvedValue(makeTier());
      prisma.tier.update.mockResolvedValue(makeTier({ priority: 2 }));

      const result = await service.update('tier-1', { priority: 2 });

      expect(prisma.tier.update).toHaveBeenCalledWith({
        where: { id: 'tier-1' },
        data: { priority: 2 },
      });
      expect(result.priority).toBe(2);
    });

    it('should throw NotFoundException when the tier does not exist', async () => {
      prisma.tier.findUnique.mockResolvedValue(null);

      await expect(service.update('missing', { priority: 2 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a tier', async () => {
      prisma.tier.findUnique.mockResolvedValue(makeTier());
      prisma.tier.delete.mockResolvedValue(makeTier());

      const result = await service.remove('tier-1');

      expect(prisma.tier.delete).toHaveBeenCalledWith({
        where: { id: 'tier-1' },
      });
      expect(result.id).toBe('tier-1');
    });

    it('should throw NotFoundException when the tier does not exist', async () => {
      prisma.tier.findUnique.mockResolvedValue(null);

      await expect(service.remove('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
