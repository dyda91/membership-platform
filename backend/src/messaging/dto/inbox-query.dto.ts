import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export enum InboxSort {
  PRIORITY = 'priority',
  RECENT = 'recent',
  UNREAD = 'unread',
  TIER = 'tier',
}

export class InboxQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Boolean)
  unread?: boolean;

  @IsOptional()
  @IsString()
  tierId?: string;

  @IsOptional()
  @IsString()
  accessStatus?: string;

  @IsOptional()
  @IsEnum(InboxSort)
  sort?: InboxSort;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 20;
}
