import { Test, TestingModule } from '@nestjs/testing';
import { PostStatus, Role } from '@prisma/client';
import { FeedService } from './feed.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { ArtistProfileService } from '../artist-profile/artist-profile.service';
import { TierAccessService } from '../tier-access/tier-access.service';

const makeArtistProfile = () => ({
  configured: true,
  name: 'Artist',
  bio: 'Bio',
  presentationText: 'Presentation',
  avatarUrl: null,
  bannerUrl: null,
  contactActions: [],
});

const makeMedia = (overrides: Record<string, unknown> = {}) => ({
  id: 'media-1',
  type: 'IMAGE' as const,
  mimeType: 'image/jpeg',
  size: 100,
  width: null,
  height: null,
  duration: null,
  position: 0,
  storageKey: 'key-1',
  createdAt: new Date('2026-01-01'),
  ...overrides,
});

const makePost = (overrides: Record<string, unknown> = {}) => ({
  id: 'post-1',
  content: 'Hello feed',
  status: PostStatus.PUBLISHED,
  authorId: 'user-1',
  tierId: null,
  title: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  author: { id: 'user-1', name: 'Artist' },
  tier: null,
  media: [makeMedia()],
  ...overrides,
});

const visitor = null;
const subscriberViewer = { roles: [Role.SUBSCRIBER], tierPriority: 1 };
const subscriberHighViewer = { roles: [Role.SUBSCRIBER], tierPriority: 3 };
const artistViewer = { roles: [Role.ARTIST], tierPriority: null };

describe('FeedService', () => {
  let service: FeedService;
  let prisma: {
    post: {
      findMany: jest.Mock;
      count: jest.Mock;
    };
  };
  let storage: { getUrl: jest.Mock };
  let artistProfileService: { getPublicProfile: jest.Mock };
  let tierAccessService: { getContentViewer: jest.Mock };

  beforeEach(async () => {
    prisma = {
      post: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
    };
    storage = { getUrl: jest.fn() };
    artistProfileService = {
      getPublicProfile: jest.fn().mockResolvedValue(makeArtistProfile()),
    };
    tierAccessService = { getContentViewer: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeedService,
        { provide: PrismaService, useValue: prisma },
        { provide: StorageService, useValue: storage },
        { provide: ArtistProfileService, useValue: artistProfileService },
        { provide: TierAccessService, useValue: tierAccessService },
      ],
    }).compile();

    service = module.get<FeedService>(FeedService);
  });

  it('returns only published posts ordered by newest first', async () => {
    prisma.post.findMany.mockResolvedValue([makePost()]);
    prisma.post.count.mockResolvedValue(1);

    await service.getFeed(visitor);

    expect(prisma.post.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: PostStatus.PUBLISHED },
        orderBy: { createdAt: 'desc' },
      }),
    );
  });

  it('exposes media URLs for public posts to visitors', async () => {
    prisma.post.findMany.mockResolvedValue([makePost()]);
    prisma.post.count.mockResolvedValue(1);
    storage.getUrl.mockResolvedValue('https://cdn/object');

    const response = await service.getFeed(visitor);

    expect(response.items[0].mediaAccess).toBe(true);
    expect(response.items[0].media[0].url).toBe('https://cdn/object');
  });

  it('hides premium media URLs from visitors', async () => {
    prisma.post.findMany.mockResolvedValue([
      makePost({ tier: { id: 't-1', name: 'Gold', priority: 2 } }),
    ]);
    prisma.post.count.mockResolvedValue(1);
    storage.getUrl.mockResolvedValue('https://cdn/secret');

    const response = await service.getFeed(visitor);

    expect(response.items[0].mediaAccess).toBe(false);
    expect(response.items[0].media[0].url).toBeUndefined();
    expect(response.items[0].media[0].locked).toBe(true);
    expect(response.items[0].requiredTier?.name).toBe('Gold');
  });

  it('allows a subscriber with the required tier to see premium media', async () => {
    prisma.post.findMany.mockResolvedValue([
      makePost({ tier: { id: 't-1', name: 'Gold', priority: 2 } }),
    ]);
    prisma.post.count.mockResolvedValue(1);
    storage.getUrl.mockResolvedValue('https://cdn/media');

    const response = await service.getFeed(subscriberHighViewer);

    expect(response.items[0].mediaAccess).toBe(true);
    expect(response.items[0].media[0].url).toBe('https://cdn/media');
  });

  it('blocks a subscriber with insufficient tier from premium media', async () => {
    prisma.post.findMany.mockResolvedValue([
      makePost({ tier: { id: 't-1', name: 'Gold', priority: 3 } }),
    ]);
    prisma.post.count.mockResolvedValue(1);

    const response = await service.getFeed(subscriberViewer);

    expect(response.items[0].mediaAccess).toBe(false);
    expect(response.items[0].media[0].url).toBeUndefined();
  });

  it('keeps premium text visible while media is locked', async () => {
    prisma.post.findMany.mockResolvedValue([
      makePost({
        content: 'Visible premium text',
        tier: { id: 't-1', name: 'Gold', priority: 3 },
      }),
    ]);
    prisma.post.count.mockResolvedValue(1);

    const response = await service.getFeed(subscriberViewer);

    expect(response.items[0].content).toBe('Visible premium text');
    expect(response.items[0].media[0].url).toBeUndefined();
  });

  it('allows ARTIST to access managed post media', async () => {
    prisma.post.findMany.mockResolvedValue([
      makePost({ tier: { id: 't-1', name: 'Gold', priority: 5 } }),
    ]);
    prisma.post.count.mockResolvedValue(1);
    storage.getUrl.mockResolvedValue('https://cdn/media');

    const response = await service.getFeed(artistViewer);

    expect(response.items[0].mediaAccess).toBe(true);
    expect(response.items[0].media[0].url).toBe('https://cdn/media');
  });

  it('serializes safely when an object URL cannot be generated', async () => {
    prisma.post.findMany.mockResolvedValue([makePost()]);
    prisma.post.count.mockResolvedValue(1);
    storage.getUrl.mockRejectedValue(new Error('object missing'));

    const response = await service.getFeed(visitor);

    expect(response.items[0].media[0].url).toBeUndefined();
  });

  it('includes the artist public profile in the response', async () => {
    prisma.post.findMany.mockResolvedValue([makePost()]);
    prisma.post.count.mockResolvedValue(1);

    const response = await service.getFeed(visitor);

    expect(response.artist.configured).toBe(true);
    expect(response.artist.name).toBe('Artist');
  });

  it('keeps the feed usable when the artist profile fails', async () => {
    prisma.post.findMany.mockResolvedValue([makePost()]);
    prisma.post.count.mockResolvedValue(1);
    artistProfileService.getPublicProfile.mockRejectedValue(new Error('boom'));

    const response = await service.getFeed(visitor);

    expect(response.artist.configured).toBe(false);
    expect(response.items).toHaveLength(1);
  });

  it('returns a controlled unconfigured artist state', async () => {
    prisma.post.findMany.mockResolvedValue([makePost()]);
    prisma.post.count.mockResolvedValue(1);
    artistProfileService.getPublicProfile.mockResolvedValue({
      configured: false,
      name: null,
      bio: null,
      presentationText: null,
      avatarUrl: null,
      bannerUrl: null,
      contactActions: [],
    });

    const response = await service.getFeed(visitor);

    expect(response.artist.configured).toBe(false);
    expect(response.artist.contactActions).toEqual([]);
  });

  it('resolves effective access from the centralized service for authenticated users', async () => {
    prisma.post.findMany.mockResolvedValue([
      makePost({ tier: { id: 't-gold', name: 'Gold', priority: 5 } }),
    ]);
    prisma.post.count.mockResolvedValue(1);
    storage.getUrl.mockResolvedValue('https://cdn/media');
    tierAccessService.getContentViewer.mockResolvedValue({
      roles: [Role.SUBSCRIBER],
      tierPriority: 5,
    });

    const response = await service.getFeed(null, 1, 20, 'user-1');

    expect(tierAccessService.getContentViewer).toHaveBeenCalledWith('user-1');
    expect(response.items[0].mediaAccess).toBe(true);
  });

  it('locks premium media when effective access is expired', async () => {
    prisma.post.findMany.mockResolvedValue([
      makePost({ tier: { id: 't-gold', name: 'Gold', priority: 5 } }),
    ]);
    prisma.post.count.mockResolvedValue(1);
    tierAccessService.getContentViewer.mockResolvedValue({
      roles: [Role.SUBSCRIBER],
      tierPriority: null,
    });

    const response = await service.getFeed(null, 1, 20, 'expired-user');

    expect(response.items[0].mediaAccess).toBe(false);
    expect(response.items[0].media[0].locked).toBe(true);
    expect(response.items[0].media[0].url).toBeUndefined();
  });
});
