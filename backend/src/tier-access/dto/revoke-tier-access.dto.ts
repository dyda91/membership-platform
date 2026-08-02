import { IsOptional, IsString } from 'class-validator';

export class RevokeTierAccessDto {
  @IsOptional()
  @IsString()
  internalNote?: string;
}
