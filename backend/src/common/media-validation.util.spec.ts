import { UnsupportedMediaTypeException } from '@nestjs/common';
import { detectImageType, validateUpload } from './media-validation.util';
import type { UploadFile } from './upload-file.type';

const png = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00,
]);

const jpeg = Buffer.from([
  0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46,
]);

const gif = Buffer.from([
  0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00,
]);

const fake = Buffer.from('not-a-real-signature');

const file = (overrides: Partial<UploadFile> = {}): UploadFile => ({
  fieldname: 'file',
  originalname: 'file.png',
  encoding: '7bit',
  mimetype: 'image/png',
  size: png.length,
  buffer: png,
  ...overrides,
});

describe('detectImageType', () => {
  it('detects PNG, JPEG and GIF signatures', () => {
    expect(detectImageType(png)).toBe('image/png');
    expect(detectImageType(jpeg)).toBe('image/jpeg');
    expect(detectImageType(gif)).toBe('image/gif');
  });

  it('returns null for unknown content', () => {
    expect(detectImageType(fake)).toBeNull();
  });
});

describe('validateUpload', () => {
  it('accepts an image whose signature matches the MIME', () => {
    expect(validateUpload(file()).kind).toBe('IMAGE');
  });

  it('rejects an image whose signature does not match the MIME', () => {
    expect(() =>
      validateUpload(file({ mimetype: 'image/jpeg', buffer: png })),
    ).toThrow(UnsupportedMediaTypeException);
  });

  it('rejects an image with no valid signature', () => {
    expect(() =>
      validateUpload(file({ mimetype: 'image/png', buffer: fake })),
    ).toThrow(UnsupportedMediaTypeException);
  });

  it('rejects an image over the size limit', () => {
    const big = Buffer.alloc(11 * 1024 * 1024, 0x89);

    expect(() =>
      validateUpload(file({ size: big.length, buffer: big })),
    ).toThrow();
  });

  it('rejects a video MIME whose content is actually an image', () => {
    expect(() =>
      validateUpload(file({ mimetype: 'video/mp4', buffer: png })),
    ).toThrow(UnsupportedMediaTypeException);
  });

  it('accepts a video MIME with non-image content', () => {
    const buffer = Buffer.from([
      0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70,
    ]);

    expect(validateUpload(file({ mimetype: 'video/mp4', buffer })).kind).toBe(
      'VIDEO',
    );
  });
});
