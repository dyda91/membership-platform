import { MediaType } from '@prisma/client';

export class UpdateMediaDto {
  url?: string;
  type?: MediaType;
}
