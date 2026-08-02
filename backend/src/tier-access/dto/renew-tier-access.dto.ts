import { Transform } from 'class-transformer';
import { IsBoolean, IsDate, IsOptional, IsString } from 'class-validator';

function toDate(value: unknown): Date | null {
  return value ? new Date(value as string) : null;
}

export class RenewTierAccessDto {
  @Transform(({ value }) => toDate(value))
  @IsDate()
  expiresAt!: Date;

  @IsOptional()
  @IsBoolean()
  permanent?: boolean;

  @IsOptional()
  @IsString()
  internalNote?: string;
}
