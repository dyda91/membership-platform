import { PostStatus } from '@prisma/client';

export class UpdatePostDto {
  textContent?: string;
  status?: PostStatus;
}
