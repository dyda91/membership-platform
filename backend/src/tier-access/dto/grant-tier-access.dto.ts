import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

function toDate(value: unknown): Date | null {
  return value ? new Date(value as string) : null;
}

export class GrantTierAccessDto {
  @IsString()
  @IsNotEmpty()
  tierId: string;

  @Transform(({ value }) => (value ? new Date(value as string) : null))
  @IsDate()
  startsAt: Date;

  @IsOptional()
  @Transform(({ value }) => toDate(value))
  @IsDate()
  expiresAt?: Date | null;

  @IsOptional()
  @IsBoolean()
  permanent?: boolean;

  @IsOptional()
  @IsString()
  internalNote?: string;
}
