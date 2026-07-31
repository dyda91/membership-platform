import { PostStatus } from '@prisma/client';

export class CreatePostDto {
  artistId: string;
  textContent: string;
  status?: PostStatus;
}
