import { Injectable } from '@nestjs/common';
import { PostStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { ArtistProfileService } from '../artist-profile/artist-profile.service';
import { TierAccessService } from '../tier-access/tier-access.service';
import { canAccessContent } from '../common/content-access.util';
import type { ContentViewer } from '../common/content-access.util';
import type { FeedArtist, FeedPost, FeedResponse } from './feed.types';

export interface FeedViewer {
  viewer: ContentViewer | null;
}

@Injectable()
export class FeedService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly artistProfileService: ArtistProfileService,
    private readonly tierAccessService: TierAccessService,
  ) {}

  async getFeed(
    viewer: ContentViewer | null,
    page = 1,
    limit = 20,
    userId?: string,
  ): Promise<FeedResponse> {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(50, Math.max(1, limit));

    // When an authenticated user is present, resolve effective content access
    // from the centralized access service rather than stale request tier data.
    const effectiveViewer = userId
      ? await this.tierAccessService.getContentViewer(userId)
      : viewer;

    const [posts, total, artist] = await Promise.all([
      this.prisma.post.findMany({
        where: { status: PostStatus.PUBLISHED },
        include: {
          author: { select: { id: true, name: true } },
          tier: true,
          media: {
            orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (safePage - 1) * safeLimit,
        take: safeLimit,
      }),
      this.prisma.post.count({
        where: { status: PostStatus.PUBLISHED },
      }),
      this.safeArtistProfile(),
    ]);

    const items: FeedPost[] = await Promise.all(
      posts.map(async (post) => {
        const access = canAccessContent(effectiveViewer, post.tier);

        const media = await Promise.all(
          post.media.map(async (item) => {
            const base = {
              id: item.id,
              type: item.type,
              mimeType: item.mimeType,
              size: item.size,
              width: item.width,
              height: item.height,
              duration: item.duration,
              position: item.position,
              locked: !access.allowed,
            };

            if (access.allowed) {
              let url: string | null = null;

              try {
                url = await this.storage.getUrl(item.storageKey);
              } catch {
                url = null;
              }

              return {
                ...base,
                url: url ?? undefined,
              };
            }

            return base;
          }),
        );

        return {
          id: post.id,
          content: post.content,
          createdAt: post.createdAt.toISOString(),
          updatedAt: post.updatedAt.toISOString(),
          author: {
            id: post.author.id,
            name: post.author.name,
          },
          requiredTier: post.tier
            ? {
                id: post.tier.id,
                name: post.tier.name,
                priority: post.tier.priority,
              }
            : null,
          mediaAccess: access.allowed,
          media,
        };
      }),
    );

    return {
      items,
      page: safePage,
      limit: safeLimit,
      total,
      artist,
    };
  }

  /**
   * Artist-profile data must never crash the Feed. Returns a safe
   * unconfigured state when no artist is active or data is unavailable.
   */
  private async safeArtistProfile(): Promise<FeedArtist> {
    try {
      return await this.artistProfileService.getPublicProfile();
    } catch {
      return {
        configured: false,
        name: null,
        bio: null,
        presentationText: null,
        avatarUrl: null,
        bannerUrl: null,
        contactActions: [],
      };
    }
  }
}
