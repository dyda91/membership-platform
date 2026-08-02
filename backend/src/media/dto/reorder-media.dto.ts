import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class ReorderMediaDto {
  @IsString()
  postId: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  mediaIds: string[];
}
