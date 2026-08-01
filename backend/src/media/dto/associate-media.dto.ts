import { IsNotEmpty, IsString } from 'class-validator';

export class AssociateMediaDto {
  @IsNotEmpty()
  @IsString()
  postId: string;
}
