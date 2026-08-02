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

interface ImageSignature {
  magic: number[];
  mime: string;
}

const IMAGE_SIGNATURES: ImageSignature[] = [
  { magic: [0xff, 0xd8, 0xff], mime: 'image/jpeg' },
  { magic: [0x89, 0x50, 0x4e, 0x47], mime: 'image/png' },
  { magic: [0x52, 0x49, 0x46, 0x46], mime: 'image/webp' },
  { magic: [0x47, 0x49, 0x46, 0x38], mime: 'image/gif' },
];

/**
 * Detects the image MIME type from the leading file bytes. Returns null when
 * the buffer does not match a known image signature.
 */
export function detectImageType(buffer: Buffer): string | null {
  if (!buffer || buffer.length < 8) {
    return null;
  }

  for (const signature of IMAGE_SIGNATURES) {
    const matches = signature.magic.every(
      (byte, index) => buffer[index] === byte,
    );

    if (matches) {
      return signature.mime;
    }
  }

  return null;
}

/**
 * Validates uploads by content rather than trusting the browser-provided
 * MIME or the filename extension.
 *
 * Images: the detected signature must match the declared MIME exactly.
 * Videos: a buffer that is clearly an image signature is rejected as a MIME
 * mismatch; full video-signature inspection is intentionally limited and
 * documented because it would require a large dependency.
 */
export function validateUpload(file: UploadFile): ValidatedUpload {
  if (!file) {
    throw new BadRequestException('No file provided');
  }

  if (IMAGE_MIME_TYPES.includes(file.mimetype)) {
    if (file.size > MAX_IMAGE_SIZE) {
      throw new BadRequestException('Image exceeds the maximum size of 10MB');
    }

    const detected = detectImageType(file.buffer);

    if (!detected) {
      throw new UnsupportedMediaTypeException('Invalid image content');
    }

    if (detected !== file.mimetype) {
      throw new UnsupportedMediaTypeException(
        'Image type does not match its content',
      );
    }

    return { kind: 'IMAGE' };
  }

  if (VIDEO_MIME_TYPES.includes(file.mimetype)) {
    if (file.size > MAX_VIDEO_SIZE) {
      throw new BadRequestException('Video exceeds the maximum size of 200MB');
    }

    if (detectImageType(file.buffer)) {
      throw new UnsupportedMediaTypeException(
        'File type does not match its content',
      );
    }

    return { kind: 'VIDEO' };
  }

  throw new UnsupportedMediaTypeException(
    'Unsupported file type. Only images and videos are allowed',
  );
}
