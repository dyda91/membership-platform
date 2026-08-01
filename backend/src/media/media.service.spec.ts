import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { MediaService } from './media.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

const makeMedia = (overrides: Record<string, unknown> = {}) => ({
  id: 'media-1',
  postId: null,
  storageKey: 'key-1',
  filename: 'key-1',
  originalName: 'photo.jpg',
  mimeType: 'image/jpeg',
  size: 1000,
  type: 'IMAGE',
  width: null,
  height: null,
  duration: null,
  createdAt: new Date('2026-01-01'),
  ...overrides,
});

const makeFile = (overrides: Record<string, unknown> = {}) => ({
  fieldname: 'file',
  originalname: 'photo.jpg',
  encoding: '7bit',
  mimetype: 'image/jpeg',
  size: 1000,
  buffer: Buffer.from([0xff, 0xd8, 0xff, 0x00, 0x00, 0x00, 0x00, 0x00]),
  ...overrides,
});

describe('MediaService', () => {
  let service: MediaService;
  let prisma: {
    media: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      count: jest.Mock;
    };
    post: { findUnique: jest.Mock };
  };
  let storage: {
    upload: jest.Mock;
    remove: jest.Mock;
    getUrl: jest.Mock;
    getObject: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      media: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      post: { findUnique: jest.fn() },
    };
    storage = {
      upload: jest.fn(),
      remove: jest.fn(),
      getUrl: jest.fn(),
      getObject: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaService,
        { provide: PrismaService, useValue: prisma },
        { provide: StorageService, useValue: storage },
      ],
    }).compile();

    service = module.get<MediaService>(MediaService);
  });

  describe('upload', () => {
    it('should store an image and return media with a URL', async () => {
      storage.upload.mockResolvedValue({
        storageKey: 'key-1',
        filename: 'key-1',
      });
      storage.getUrl.mockResolvedValue('https://url');
      prisma.media.create.mockResolvedValue(makeMedia());

      const result = await service.upload(makeFile());

      const expectedData = {
        storageKey: 'key-1',
        filename: 'key-1',
        originalName: 'photo.jpg',
        mimeType: 'image/jpeg',
        size: 1000,
        type: 'IMAGE',
        width: undefined,
        height: undefined,
        duration: undefined,
        postId: null,
        position: 0,
      };

      expect(storage.upload).toHaveBeenCalled();
      expect(prisma.media.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expectedData }),
      );
      expect(result.url).toBeDefined();
    });

    it('should reject an unsupported MIME type', async () => {
      await expect(
        service.upload(makeFile({ mimetype: 'application/pdf' })),
      ).rejects.toThrow(UnsupportedMediaTypeException);
    });

    it('should reject an invalid image signature', async () => {
      await expect(
        service.upload(makeFile({ buffer: Buffer.from([0x00, 0x01, 0x02]) })),
      ).rejects.toThrow(UnsupportedMediaTypeException);
    });

    it('should reject a postId that does not exist', async () => {
      prisma.post.findUnique.mockResolvedValue(null);

      await expect(service.upload(makeFile(), 'missing-post')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findOne', () => {
    it('should return media when it exists', async () => {
      prisma.media.findUnique.mockResolvedValue(makeMedia());
      storage.getUrl.mockResolvedValue('https://url');

      const result = await service.findOne('media-1');

      expect(result.id).toBe('media-1');
      expect(result.url).toBe('https://url');
    });

    it('should throw NotFoundException when media does not exist', async () => {
      prisma.media.findUnique.mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getFile', () => {
    it('should stream the object for an authorized viewer', async () => {
      prisma.media.findUnique.mockResolvedValue(
        makeMedia({ post: { tier: null } }),
      );
      storage.getObject = jest.fn().mockResolvedValue(Buffer.from('data'));

      const result = await service.getFile('media-1', {
        roles: [Role.SUBSCRIBER],
        tierPriority: 1,
      });

      expect(result.buffer).toEqual(Buffer.from('data'));
      expect(result.mimeType).toBe('image/jpeg');
    });

    it('should throw ForbiddenException for a visitor on premium media', async () => {
      prisma.media.findUnique.mockResolvedValue(
        makeMedia({ post: { tier: { priority: 2 } } }),
      );

      await expect(service.getFile('media-1', null)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw ForbiddenException when the tier is insufficient', async () => {
      prisma.media.findUnique.mockResolvedValue(
        makeMedia({ post: { tier: { priority: 3 } } }),
      );

      await expect(
        service.getFile('media-1', {
          roles: [Role.SUBSCRIBER],
          tierPriority: 1,
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when the object is missing', async () => {
      prisma.media.findUnique.mockResolvedValue(
        makeMedia({ post: { tier: null } }),
      );
      storage.getObject = jest.fn().mockResolvedValue(null);

      await expect(
        service.getFile('media-1', {
          roles: [Role.SUBSCRIBER],
          tierPriority: 1,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove the object and metadata', async () => {
      prisma.media.findUnique.mockResolvedValue(makeMedia());
      prisma.media.delete.mockResolvedValue(makeMedia());

      const result = await service.remove('media-1');

      expect(storage.remove).toHaveBeenCalledWith('key-1');
      expect(prisma.media.delete).toHaveBeenCalledWith({
        where: { id: 'media-1' },
      });
      expect(result.id).toBe('media-1');
    });

    it('should throw NotFoundException when media does not exist', async () => {
      prisma.media.findUnique.mockResolvedValue(null);

      await expect(service.remove('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
