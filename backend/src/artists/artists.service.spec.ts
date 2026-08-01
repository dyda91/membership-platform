import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ArtistsService } from './artists.service';
import { PrismaService } from '../prisma/prisma.service';

const makeArtist = (overrides: Record<string, unknown> = {}) => ({
  id: 'artist-1',
  userId: 'user-1',
  name: 'Artist',
  description: 'A description',
  bio: null,
  avatarUrl: null,
  bannerUrl: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  ...overrides,
});

describe('ArtistsService', () => {
  let service: ArtistsService;
  let prisma: { artist: { findUnique: jest.Mock; update: jest.Mock } };

  beforeEach(async () => {
    prisma = {
      artist: { findUnique: jest.fn(), update: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ArtistsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<ArtistsService>(ArtistsService);
  });

  describe('getProfile', () => {
    it('should return the profile for the user', async () => {
      prisma.artist.findUnique.mockResolvedValue(makeArtist());

      const result = await service.getProfile('user-1');

      expect(prisma.artist.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });
      expect(result?.name).toBe('Artist');
    });

    it('should throw NotFoundException when the profile does not exist', async () => {
      prisma.artist.findUnique.mockResolvedValue(null);

      await expect(service.getProfile('user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateProfile', () => {
    it('should update the profile fields', async () => {
      prisma.artist.findUnique.mockResolvedValue(makeArtist());
      prisma.artist.update.mockResolvedValue(
        makeArtist({ bio: 'New bio', avatarUrl: 'https://img' }),
      );

      const result = await service.updateProfile('user-1', {
        bio: 'New bio',
        avatarUrl: 'https://img',
      });

      const expectedData = {
        bio: 'New bio',
        avatarUrl: 'https://img',
      };

      expect(prisma.artist.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-1' },
          data: expectedData,
        }),
      );
      expect(result.bio).toBe('New bio');
    });

    it('should throw UnauthorizedException when the profile does not exist', async () => {
      prisma.artist.findUnique.mockResolvedValue(null);

      await expect(
        service.updateProfile('user-1', { bio: 'New bio' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
