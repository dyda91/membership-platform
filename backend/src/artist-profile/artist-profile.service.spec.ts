import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { ArtistProfileService } from './artist-profile.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

const actor = { id: 'user-1', roles: [Role.ARTIST] };
const adminActor = { id: 'root-1', roles: [Role.SUPER_ADMIN] };
const subscriberActor = { id: 'sub-1', roles: [Role.SUBSCRIBER] };

const makeArtist = (overrides: Record<string, unknown> = {}) => ({
  id: 'artist-1',
  userId: 'user-1',
  name: 'Artist',
  description: 'desc',
  bio: null,
  presentationText: null,
  avatarMediaId: null,
  bannerMediaId: null,
  whatsappValue: null,
  whatsappEnabled: false,
  discordUrl: null,
  discordEnabled: false,
  contactButtonText: null,
  avatarMedia: null,
  bannerMedia: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  ...overrides,
});

describe('ArtistProfileService', () => {
  let service: ArtistProfileService;
  let prisma: {
    artist: {
      findFirst: jest.Mock;
      update: jest.Mock;
      create: jest.Mock;
    };
    media: { create: jest.Mock };
  };
  let storage: { getUrl: jest.Mock; upload: jest.Mock };

  beforeEach(async () => {
    prisma = {
      artist: {
        findFirst: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
      },
      media: { create: jest.fn() },
    };
    storage = {
      getUrl: jest.fn(),
      upload: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArtistProfileService,
        { provide: PrismaService, useValue: prisma },
        { provide: StorageService, useValue: storage },
      ],
    }).compile();

    service = module.get<ArtistProfileService>(ArtistProfileService);
  });

  describe('getPublicProfile', () => {
    it('returns a controlled unconfigured state when no artist exists', async () => {
      prisma.artist.findFirst.mockResolvedValue(null);

      const result = await service.getPublicProfile();

      expect(result.configured).toBe(false);
      expect(result.contactActions).toEqual([]);
    });

    it('returns only public-safe fields with enabled contact actions', async () => {
      prisma.artist.findFirst.mockResolvedValue(
        makeArtist({
          whatsappValue: '5511999998888',
          whatsappEnabled: true,
          discordUrl: 'https://discord.gg/abc',
          discordEnabled: true,
          avatarMedia: { storageKey: 'av-key' },
          bannerMedia: { storageKey: 'bn-key' },
        }),
      );
      storage.getUrl.mockResolvedValue('https://cdn/url');

      const result = await service.getPublicProfile();

      expect(result.configured).toBe(true);
      expect(result.name).toBe('Artist');
      expect(result.avatarUrl).toBe('https://cdn/url');
      expect(result.contactActions).toHaveLength(2);
      expect(result.contactActions[0].type).toBe('WHATSAPP');
      expect(result.contactActions[0].url).toBe('https://wa.me/5511999998888');
      expect(result.contactActions[1].type).toBe('DISCORD');
    });

    it('excludes disabled contact channels', async () => {
      prisma.artist.findFirst.mockResolvedValue(
        makeArtist({
          whatsappValue: '5511999998888',
          whatsappEnabled: false,
          discordUrl: 'https://discord.gg/abc',
          discordEnabled: false,
        }),
      );

      const result = await service.getPublicProfile();

      expect(result.contactActions).toEqual([]);
    });

    it('never exposes internal storage or account fields publicly', async () => {
      prisma.artist.findFirst.mockResolvedValue(makeArtist());

      const result = await service.getPublicProfile();

      expect(result).not.toHaveProperty('artistUserId');
      expect(result).not.toHaveProperty('whatsappValue');
      expect(result).not.toHaveProperty('discordUrl');
    });
  });

  describe('updateProfile', () => {
    it('allows the active artist to update allowlisted fields', async () => {
      prisma.artist.findFirst.mockResolvedValue(makeArtist());
      prisma.artist.update.mockResolvedValue(
        makeArtist({ name: 'New Name', bio: 'New bio', whatsappEnabled: true }),
      );

      const result = await service.updateProfile(actor, {
        name: 'New Name',
        bio: 'New bio',
        whatsappValue: '5511999998888',
        whatsappEnabled: true,
      });

      expect(result.name).toBe('New Name');
      expect(prisma.artist.update).toHaveBeenCalled();
    });

    it('allows SUPER_ADMIN to update the profile', async () => {
      prisma.artist.findFirst.mockResolvedValue(makeArtist());
      prisma.artist.update.mockResolvedValue(makeArtist());

      await service.updateProfile(adminActor, { name: 'Admin edit' });

      expect(prisma.artist.update).toHaveBeenCalled();
    });

    it('rejects updates from a subscriber', async () => {
      prisma.artist.findFirst.mockResolvedValue(makeArtist());

      await expect(
        service.updateProfile(subscriberActor, { name: 'Hack' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('rejects an invalid WhatsApp number', async () => {
      prisma.artist.findFirst.mockResolvedValue(makeArtist());

      await expect(
        service.updateProfile(actor, { whatsappValue: 'not-a-number' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws NotFound when no artist is configured', async () => {
      prisma.artist.findFirst.mockResolvedValue(null);

      await expect(
        service.updateProfile(actor, { name: 'New' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('uploadAvatar', () => {
    it('stores an image and updates the profile reference', async () => {
      prisma.artist.findFirst.mockResolvedValue(makeArtist());
      storage.upload.mockResolvedValue({ storageKey: 'av-key' });
      prisma.media.create.mockResolvedValue({ id: 'media-1' });
      prisma.artist.update.mockResolvedValue(
        makeArtist({
          avatarMediaId: 'media-1',
          avatarMedia: { storageKey: 'av-key' },
        }),
      );
      storage.getUrl.mockResolvedValue('https://cdn/avatar');

      const file = {
        originalname: 'avatar.png',
        mimetype: 'image/png',
        size: 100,
        buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      } as never;

      const result = await service.uploadAvatar(actor, file);

      expect(storage.upload).toHaveBeenCalled();
      expect(prisma.media.create).toHaveBeenCalled();
      expect(prisma.artist.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'artist-1' },
          data: { avatarMediaId: 'media-1' },
        }),
      );
      expect(result.avatarUrl).toBe('https://cdn/avatar');
    });

    it('rejects a non-image file', async () => {
      prisma.artist.findFirst.mockResolvedValue(makeArtist());

      const file = {
        originalname: 'video.mp4',
        mimetype: 'video/mp4',
        size: 100,
        buffer: Buffer.from('x'),
      } as never;

      await expect(service.uploadAvatar(actor, file)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('rejects uploads from a subscriber', async () => {
      prisma.artist.findFirst.mockResolvedValue(makeArtist());

      const file = {
        originalname: 'a.png',
        mimetype: 'image/png',
        size: 100,
        buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      } as never;

      await expect(service.uploadAvatar(subscriberActor, file)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
