import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { validateUpload } from '../common/media-validation.util';
import { canAccessContent } from '../common/content-access.util';
import type { ContentViewer } from '../common/content-access.util';
import type { UploadFile } from '../common/upload-file.type';

@Injectable()
export class MediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async upload(file: UploadFile, postId?: string) {
    const validated = validateUpload(file);

    let position = 0;

    if (postId) {
      const post = await this.prisma.post.findUnique({
        where: { id: postId },
      });

      if (!post) {
        throw new BadRequestException('Post not found');
      }

      const count = await this.prisma.media.count({ where: { postId } });
      position = count;
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
        position,
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

  /**
   * Returns a streamable representation of the media object when the viewer
   * has access, otherwise throws ForbiddenException. The URL is never exposed
   * here; the response streams the raw object with its stored content type.
   */
  async getFile(id: string, viewer: ContentViewer | null) {
    const media = await this.prisma.media.findUnique({
      where: { id },
      include: { post: { include: { tier: true } } },
    });

    if (!media) {
      throw new NotFoundException('Media not found');
    }

    const access = canAccessContent(viewer, media.post?.tier ?? null);

    if (!access.allowed) {
      throw new ForbiddenException('Insufficient tier access');
    }

    const data = await this.storage.getObject(media.storageKey);

    if (!data) {
      throw new NotFoundException('Media object not found');
    }

    return {
      buffer: data,
      mimeType: media.mimeType,
      filename: media.originalName,
    };
  }

  async findByPost(postId: string) {
    const media = await this.prisma.media.findMany({
      where: { postId },
      orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
    });

    return Promise.all(
      media.map(async (item) => ({
        ...item,
        url: await this.storage.getUrl(item.storageKey),
      })),
    );
  }

  /**
   * Persists an explicit media order for a post. Every media item currently
   * associated with the post must be present exactly once; positions are
   * reassigned sequentially. Returns the post media in the new order.
   */
  async reorder(postId: string, mediaIds: string[]) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new BadRequestException('Post not found');
    }

    const current = await this.prisma.media.findMany({
      where: { postId },
      select: { id: true },
    });

    const validIds = new Set(current.map((item) => item.id));

    if (
      mediaIds.length !== validIds.size ||
      mediaIds.some((id) => !validIds.has(id))
    ) {
      throw new BadRequestException(
        'Invalid media order: all post media must be included exactly once',
      );
    }

    await this.prisma.$transaction(
      mediaIds.map((id, index) =>
        this.prisma.media.update({ where: { id }, data: { position: index } }),
      ),
    );

    return this.findByPost(postId);
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

    const count = await this.prisma.media.count({ where: { postId } });

    return this.prisma.media.update({
      where: { id: mediaId },
      data: { postId, position: count },
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
