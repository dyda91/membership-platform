import { IsNotEmpty, IsString } from 'class-validator';

export class AssignArtistDto {
  @IsNotEmpty()
  @IsString()
  userId: string;
}
