import { Role } from '@prisma/client';

export class CreateUserDto {
  email: string;
  passwordHash: string;
  role: Role;
}
