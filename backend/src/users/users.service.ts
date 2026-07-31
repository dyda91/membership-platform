import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AccountStatus, Role, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

export interface SafeUser {
  id: string;
  email: string;
  name: string | null;
  status: AccountStatus;
  roles: Role[];
  createdAt: Date;
  updatedAt: Date;
}

interface CreateUserData {
  email: string;
  passwordHash: string;
  name?: string;
  roles?: Role[];
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserData) {
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        name: data.name,
        roles: {
          create: (data.roles ?? [Role.SUBSCRIBER]).map((role) => ({ role })),
        },
      },
      include: { roles: true },
    });

    return this.sanitize(user);
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      include: { roles: true },
      orderBy: { createdAt: 'asc' },
    });

    return users.map((user) => this.sanitize(user));
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { roles: true },
    });

    return user ? this.sanitize(user) : null;
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: { roles: true },
    });
  }

  async getProfile(id: string) {
    const user = await this.getUserOrThrow(id);

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      include: { roles: true },
    });

    return this.sanitize(user);
  }

  async assignRole(id: string, role: Role) {
    await this.getUserOrThrow(id);

    await this.prisma.userRole.upsert({
      where: { userId_role: { userId: id, role } },
      create: { userId: id, role },
      update: {},
    });

    return this.findOne(id);
  }

  async removeRole(id: string, role: Role) {
    await this.getUserOrThrow(id);

    try {
      await this.prisma.userRole.delete({
        where: { userId_role: { userId: id, role } },
      });
    } catch {
      throw new ConflictException('Role is not assigned to this user');
    }

    return this.findOne(id);
  }

  async setStatus(id: string, status: AccountStatus) {
    const user = await this.prisma.user.update({
      where: { id },
      data: { status },
      include: { roles: true },
    });

    return this.sanitize(user);
  }

  async remove(id: string) {
    const user = await this.prisma.user.delete({
      where: { id },
      include: { roles: true },
    });

    return this.sanitize(user);
  }

  private async getUserOrThrow(id: string): Promise<SafeUser> {
    const user = await this.findOne(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  private sanitize(user: User & { roles: { role: Role }[] }): SafeUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      status: user.status,
      roles: user.roles.map((item) => item.role),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
