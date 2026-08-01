import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateOwnProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;
}
