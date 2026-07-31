import { Role } from '@prisma/client';

export class UpdateUserDto {
  email?: string;
  passwordHash?: string;
  role?: Role;
}
