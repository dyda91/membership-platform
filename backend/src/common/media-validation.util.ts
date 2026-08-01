import {
  BadRequestException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import {
  IMAGE_MIME_TYPES,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
  VIDEO_MIME_TYPES,
} from '../storage/storage.service';
import type { UploadFile } from './upload-file.type';

export type MediaKind = 'IMAGE' | 'VIDEO';

export interface ValidatedUpload {
  kind: MediaKind;
  width?: number;
  height?: number;
  duration?: number;
}

const IMAGE_SIGNATURES: { magic: number[]; ext: string }[] = [
  { magic: [0xff, 0xd8, 0xff], ext: 'jpeg' },
  { magic: [0x89, 0x50, 0x4e, 0x47], ext: 'png' },
  { magic: [0x52, 0x49, 0x46, 0x46], ext: 'webp' },
  { magic: [0x47, 0x49, 0x46, 0x38], ext: 'gif' },
];

export function validateUpload(file: UploadFile): ValidatedUpload {
  if (!file) {
    throw new BadRequestException('No file provided');
  }

  if (IMAGE_MIME_TYPES.includes(file.mimetype)) {
    if (file.size > MAX_IMAGE_SIZE) {
      throw new BadRequestException('Image exceeds the maximum size of 10MB');
    }

    if (!hasValidImageSignature(file.buffer)) {
      throw new UnsupportedMediaTypeException('Invalid image content');
    }

    return { kind: 'IMAGE' };
  }

  if (VIDEO_MIME_TYPES.includes(file.mimetype)) {
    if (file.size > MAX_VIDEO_SIZE) {
      throw new BadRequestException('Video exceeds the maximum size of 200MB');
    }

    return { kind: 'VIDEO' };
  }

  throw new UnsupportedMediaTypeException(
    'Unsupported file type. Only images and videos are allowed',
  );
}

function hasValidImageSignature(buffer: Buffer): boolean {
  if (!buffer || buffer.length < 8) {
    return false;
  }

  return IMAGE_SIGNATURES.some(({ magic }) =>
    magic.every((byte, index) => buffer[index] === byte),
  );
}
