import { Transform } from 'class-transformer';
import { AccountStatus, Role } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export const MAX_PAGE_SIZE = 100;
export const DEFAULT_PAGE_SIZE = 20;

function toNumber(value: unknown): number {
  return Number(value);
}

function trimValue(value: unknown): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

export class ListUsersQueryDto {
  @IsOptional()
  @Transform(({ value }) => trimValue(value))
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  tierId?: string;

  @IsOptional()
  @IsEnum(AccountStatus)
  status?: AccountStatus;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @Transform(({ value }) => toNumber(value))
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Transform(({ value }) => toNumber(value))
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_SIZE)
  limit?: number;
}
