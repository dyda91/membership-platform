import { MediaType } from '@prisma/client';

export class CreateMediaDto {
  postId: string;
  url: string;
  type: MediaType;
}
