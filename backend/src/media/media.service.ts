import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { validateUpload } from '../common/media-validation.util';
import type { UploadFile } from '../common/upload-file.type';

@Injectable()
export class MediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async upload(file: UploadFile, postId?: string) {
    const validated = validateUpload(file);

    if (postId) {
      const post = await this.prisma.post.findUnique({
        where: { id: postId },
      });

      if (!post) {
        throw new BadRequestException('Post not found');
      }
    }

    const { storageKey } = await this.storage.upload(file);

    const media = await this.prisma.media.create({
      data: {
        storageKey,
        filename: storageKey,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        type: validated.kind,
        width: validated.width,
        height: validated.height,
        duration: validated.duration,
        postId: postId ?? null,
      },
    });

    return { ...media, url: await this.storage.getUrl(media.storageKey) };
  }

  async findAll() {
    const media = await this.prisma.media.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return Promise.all(
      media.map(async (item) => ({
        ...item,
        url: await this.storage.getUrl(item.storageKey),
      })),
    );
  }

  async findOne(id: string) {
    const media = await this.prisma.media.findUnique({ where: { id } });

    if (!media) {
      throw new NotFoundException('Media not found');
    }

    return { ...media, url: await this.storage.getUrl(media.storageKey) };
  }

  async findByPost(postId: string) {
    const media = await this.prisma.media.findMany({
      where: { postId },
      orderBy: { createdAt: 'asc' },
    });

    return Promise.all(
      media.map(async (item) => ({
        ...item,
        url: await this.storage.getUrl(item.storageKey),
      })),
    );
  }

  async associate(postId: string, mediaId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new BadRequestException('Post not found');
    }

    const media = await this.prisma.media.findUnique({
      where: { id: mediaId },
    });

    if (!media) {
      throw new NotFoundException('Media not found');
    }

    return this.prisma.media.update({
      where: { id: mediaId },
      data: { postId },
    });
  }

  async remove(id: string) {
    const media = await this.prisma.media.findUnique({ where: { id } });

    if (!media) {
      throw new NotFoundException('Media not found');
    }

    try {
      await this.storage.remove(media.storageKey);
    } catch {
      // Best effort: remove metadata even if object is already gone
    }

    return this.prisma.media.delete({ where: { id } });
  }
}
