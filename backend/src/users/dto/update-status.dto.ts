import { AccountStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateStatusDto {
  @IsEnum(AccountStatus)
  status: AccountStatus;
}
