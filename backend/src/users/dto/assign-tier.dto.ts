import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AssignTierDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  tierId?: string | null;
}
