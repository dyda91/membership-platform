import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PostStatus, Role } from '@prisma/client';
import { PostsService } from './posts.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

const actor = { id: 'user-1', roles: [Role.ARTIST] };
const adminActor = { id: 'user-2', roles: [Role.SUPER_ADMIN] };

const makePost = (overrides: Record<string, unknown> = {}) => ({
  id: 'post-1',
  title: null,
  content: 'World',
  status: PostStatus.DRAFT,
  authorId: 'user-1',
  tierId: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  author: { id: 'user-1', email: 'a@test.com', name: null },
  tier: null,
  media: [],
  ...overrides,
});

describe('PostsService', () => {
  let service: PostsService;
  let prisma: {
    post: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    tier: { findUnique: jest.Mock };
  };
  let storage: { getUrl: jest.Mock };

  beforeEach(async () => {
    prisma = {
      post: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      tier: { findUnique: jest.fn() },
    };
    storage = { getUrl: jest.fn().mockResolvedValue('https://cdn/object') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        { provide: PrismaService, useValue: prisma },
        { provide: StorageService, useValue: storage },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
  });

  describe('create', () => {
    it('should create a titleless post with DRAFT status by default', async () => {
      prisma.post.create.mockResolvedValue(makePost());

      const result = await service.create(actor, {
        content: 'World',
      });

      const expectedData = {
        title: undefined,
        content: 'World',
        status: PostStatus.DRAFT,
        authorId: 'user-1',
        tierId: null,
      };

      expect(prisma.post.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expectedData }),
      );
      expect(result.status).toBe(PostStatus.DRAFT);
    });

    it('should create a text-only post without media requirements', async () => {
      prisma.post.create.mockResolvedValue(makePost());

      const result = await service.create(actor, {
        content: 'Only text',
      });

      expect(result.content).toBe('World');
      expect(prisma.post.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException when the tier does not exist', async () => {
      prisma.tier.findUnique.mockResolvedValue(null);

      await expect(
        service.create(actor, {
          content: 'Hello',
          tierId: 'missing',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should list own posts for an artist', async () => {
      prisma.post.findMany.mockResolvedValue([makePost()]);

      await service.findAll(actor);

      expect(prisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { authorId: 'user-1' },
        }),
      );
    });

    it('should list all posts for a super admin', async () => {
      prisma.post.findMany.mockResolvedValue([makePost()]);

      await service.findAll(adminActor);

      expect(prisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return the post when owned by the artist', async () => {
      prisma.post.findUnique.mockResolvedValue(makePost());

      const result = await service.findOne(actor, 'post-1');

      expect(result?.id).toBe('post-1');
    });

    it('should forbid accessing another artist post', async () => {
      prisma.post.findUnique.mockResolvedValue(
        makePost({ authorId: 'other-user' }),
      );

      await expect(service.findOne(actor, 'post-1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw NotFoundException when the post does not exist', async () => {
      prisma.post.findUnique.mockResolvedValue(null);

      await expect(service.findOne(actor, 'missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update an owned post without a title', async () => {
      prisma.post.findUnique.mockResolvedValue(makePost());
      prisma.post.update.mockResolvedValue(makePost({ content: 'Updated' }));

      const result = await service.update(actor, 'post-1', {
        content: 'Updated',
      });

      expect(result.content).toBe('Updated');
    });

    it('should throw ForbiddenException when updating another artist post', async () => {
      prisma.post.findUnique.mockResolvedValue(
        makePost({ authorId: 'other-user' }),
      );

      await expect(
        service.update(actor, 'post-1', { content: 'Updated' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('publish', () => {
    it('should publish a post without tier', async () => {
      prisma.post.findUnique.mockResolvedValue(makePost());
      prisma.post.update.mockResolvedValue(
        makePost({ status: PostStatus.PUBLISHED }),
      );

      const result = await service.publish(actor, 'post-1');

      expect(result.status).toBe(PostStatus.PUBLISHED);
    });

    it('should validate the tier before publishing premium content', async () => {
      prisma.post.findUnique.mockResolvedValue(makePost({ tierId: 'tier-1' }));
      prisma.tier.findUnique.mockResolvedValue(null);

      await expect(service.publish(actor, 'post-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should publish premium content when the tier exists', async () => {
      prisma.post.findUnique.mockResolvedValue(makePost({ tierId: 'tier-1' }));
      prisma.tier.findUnique.mockResolvedValue({ id: 'tier-1' });
      prisma.post.update.mockResolvedValue(
        makePost({ status: PostStatus.PUBLISHED, tierId: 'tier-1' }),
      );

      const result = await service.publish(actor, 'post-1');

      expect(result.status).toBe(PostStatus.PUBLISHED);
    });
  });

  describe('archive', () => {
    it('should archive an owned post', async () => {
      prisma.post.findUnique.mockResolvedValue(makePost());
      prisma.post.update.mockResolvedValue(
        makePost({ status: PostStatus.ARCHIVED }),
      );

      const result = await service.archive(actor, 'post-1');

      expect(result.status).toBe(PostStatus.ARCHIVED);
    });
  });

  describe('remove', () => {
    it('should delete an owned post', async () => {
      prisma.post.findUnique.mockResolvedValue(makePost());
      prisma.post.delete.mockResolvedValue(makePost());

      const result = await service.remove(actor, 'post-1');

      expect(result.id).toBe('post-1');
    });
  });
});
