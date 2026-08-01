import { IsOptional, IsString } from 'class-validator';

export class UploadMediaDto {
  @IsOptional()
  @IsString()
  postId?: string;
}
