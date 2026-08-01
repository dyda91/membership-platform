import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import type { UploadFile } from '../common/upload-file.type';

export const IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

export const VIDEO_MIME_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
export const MAX_VIDEO_SIZE = 200 * 1024 * 1024;

export interface UploadedFileResult {
  storageKey: string;
  filename: string;
}

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private client: Minio.Client;
  private readonly bucket: string;

  constructor(private readonly config: ConfigService) {
    this.bucket = config.getOrThrow<string>('MINIO_BUCKET');
    this.client = new Minio.Client({
      endPoint: config.getOrThrow<string>('MINIO_ENDPOINT'),
      port: Number(config.getOrThrow<string>('MINIO_PORT')),
      useSSL: config.get<string>('MINIO_USE_SSL') === 'true',
      accessKey: config.getOrThrow<string>('MINIO_ACCESS_KEY'),
      secretKey: config.getOrThrow<string>('MINIO_SECRET_KEY'),
    });
  }

  async onModuleInit() {
    const exists = await this.client.bucketExists(this.bucket);

    if (!exists) {
      await this.client.makeBucket(this.bucket);
      this.logger.log(`Bucket "${this.bucket}" created`);
    }
  }

  async upload(file: UploadFile): Promise<UploadedFileResult> {
    const storageKey = this.buildStorageKey(file.originalname);

    await this.client.putObject(
      this.bucket,
      storageKey,
      file.buffer,
      file.size,
      { 'Content-Type': file.mimetype },
    );

    return { storageKey, filename: storageKey };
  }

  async remove(storageKey: string) {
    await this.client.removeObject(this.bucket, storageKey);
  }

  async getUrl(storageKey: string): Promise<string> {
    return this.client.presignedGetObject(this.bucket, storageKey, 3600);
  }

  async getObject(storageKey: string): Promise<Buffer | null> {
    try {
      const stream = await this.client.getObject(this.bucket, storageKey);

      return await new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = [];

        stream.on('data', (chunk: Buffer) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
      });
    } catch {
      return null;
    }
  }

  async objectExists(storageKey: string): Promise<boolean> {
    try {
      await this.client.statObject(this.bucket, storageKey);

      return true;
    } catch {
      return false;
    }
  }

  private buildStorageKey(originalName: string): string {
    const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
  }
}
