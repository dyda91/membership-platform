import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PostStatus, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

export interface PostActor {
  id: string;
  roles: Role[];
}

const postInclude = {
  author: { select: { id: true, email: true, name: true } },
  tier: true,
  coverMedia: true,
  media: { orderBy: { createdAt: 'asc' as const } },
};

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(actor: PostActor, dto: CreatePostDto) {
    await this.validateTier(dto.tierId);
    await this.validateCoverMedia(dto.coverMediaId);

    const post = await this.prisma.post.create({
      data: {
        title: dto.title,
        content: dto.content,
        status: dto.status ?? PostStatus.DRAFT,
        tierId: dto.tierId ?? null,
        coverMediaId: dto.coverMediaId ?? null,
        authorId: actor.id,
      },
      include: postInclude,
    });

    return post;
  }

  async findAll(actor: PostActor) {
    const isAdmin = actor.roles.includes(Role.SUPER_ADMIN);

    const posts = await this.prisma.post.findMany({
      where: isAdmin ? {} : { authorId: actor.id },
      include: postInclude,
      orderBy: { createdAt: 'desc' },
    });

    return posts;
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

    return post;
  }

  async update(actor: PostActor, id: string, dto: UpdatePostDto) {
    await this.getOwnedPost(actor, id);

    if (dto.tierId !== undefined) {
      await this.validateTier(dto.tierId);
    }

    if (dto.coverMediaId !== undefined) {
      await this.validateCoverMedia(dto.coverMediaId);
    }

    return this.prisma.post.update({
      where: { id },
      data: {
        title: dto.title,
        content: dto.content,
        tierId: dto.tierId,
        coverMediaId: dto.coverMediaId,
      },
      include: postInclude,
    });
  }

  async remove(actor: PostActor, id: string) {
    await this.getOwnedPost(actor, id);

    return this.prisma.post.delete({ where: { id }, include: postInclude });
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

    return this.prisma.post.update({
      where: { id },
      data: { status: PostStatus.PUBLISHED },
      include: postInclude,
    });
  }

  async archive(actor: PostActor, id: string) {
    await this.getOwnedPost(actor, id);

    return this.prisma.post.update({
      where: { id },
      data: { status: PostStatus.ARCHIVED },
      include: postInclude,
    });
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

  private async validateCoverMedia(mediaId: string | null | undefined) {
    if (!mediaId) {
      return;
    }

    const media = await this.prisma.media.findUnique({
      where: { id: mediaId },
    });

    if (!media) {
      throw new BadRequestException('Cover media not found');
    }
  }
}
