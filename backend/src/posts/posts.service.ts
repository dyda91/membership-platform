import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PostStatus, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

export interface PostActor {
  id: string;
  roles: Role[];
}

const postInclude = {
  author: { select: { id: true, email: true, name: true } },
  tier: true,
  media: {
    orderBy: [{ position: 'asc' as const }, { createdAt: 'asc' as const }],
  },
};

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async create(actor: PostActor, dto: CreatePostDto) {
    await this.validateTier(dto.tierId);

    const post = await this.prisma.post.create({
      data: {
        title: dto.title,
        content: dto.content,
        status: dto.status ?? PostStatus.DRAFT,
        tierId: dto.tierId ?? null,
        authorId: actor.id,
      },
      include: postInclude,
    });

    return this.withMediaUrls(post);
  }

  async findAll(actor: PostActor) {
    const isAdmin = actor.roles.includes(Role.SUPER_ADMIN);

    const posts = await this.prisma.post.findMany({
      where: isAdmin ? {} : { authorId: actor.id },
      include: postInclude,
      orderBy: { createdAt: 'desc' },
    });

    return Promise.all(posts.map((post) => this.withMediaUrls(post)));
  }

  async findOne(actor: PostActor, id: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: postInclude,
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    this.assertCanAccess(actor, post.authorId);

    return this.withMediaUrls(post);
  }

  async update(actor: PostActor, id: string, dto: UpdatePostDto) {
    await this.getOwnedPost(actor, id);

    if (dto.tierId !== undefined) {
      await this.validateTier(dto.tierId);
    }

    const updated = await this.prisma.post.update({
      where: { id },
      data: {
        title: dto.title,
        content: dto.content,
        tierId: dto.tierId,
      },
      include: postInclude,
    });

    return this.withMediaUrls(updated);
  }

  async remove(actor: PostActor, id: string) {
    await this.getOwnedPost(actor, id);

    const deleted = await this.prisma.post.delete({
      where: { id },
      include: postInclude,
    });

    return this.withMediaUrls(deleted);
  }

  async publish(actor: PostActor, id: string) {
    const post = await this.getOwnedPost(actor, id);

    if (post.tierId) {
      const tier = await this.prisma.tier.findUnique({
        where: { id: post.tierId },
      });

      if (!tier) {
        throw new BadRequestException('Tier not found');
      }
    }

    const updated = await this.prisma.post.update({
      where: { id },
      data: { status: PostStatus.PUBLISHED },
      include: postInclude,
    });

    return this.withMediaUrls(updated);
  }

  async archive(actor: PostActor, id: string) {
    await this.getOwnedPost(actor, id);

    const updated = await this.prisma.post.update({
      where: { id },
      data: { status: PostStatus.ARCHIVED },
      include: postInclude,
    });

    return this.withMediaUrls(updated);
  }

  private async withMediaUrls<T extends { media: { storageKey: string }[] }>(
    post: T,
  ) {
    const media = await Promise.all(
      post.media.map(async (item) => {
        try {
          return { ...item, url: await this.storage.getUrl(item.storageKey) };
        } catch {
          return item;
        }
      }),
    );

    return { ...post, media };
  }

  private async getOwnedPost(actor: PostActor, id: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: postInclude,
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    this.assertCanAccess(actor, post.authorId);

    return post;
  }

  private assertCanAccess(actor: PostActor, authorId: string) {
    const isAdmin = actor.roles.includes(Role.SUPER_ADMIN);

    if (!isAdmin && actor.id !== authorId) {
      throw new ForbiddenException('You can only manage your own posts');
    }
  }

  private async validateTier(tierId: string | null | undefined) {
    if (!tierId) {
      return;
    }

    const tier = await this.prisma.tier.findUnique({
      where: { id: tierId },
    });

    if (!tier) {
      throw new BadRequestException('Tier not found');
    }
  }
}
