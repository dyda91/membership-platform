import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AccountStatus, Role, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

export interface SafeUserTier {
  id: string;
  name: string;
  priority: number;
}

export interface SafeUser {
  id: string;
  email: string;
  name: string | null;
  status: AccountStatus;
  roles: Role[];
  tierId: string | null;
  tier: SafeUserTier | null;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateUserData {
  email: string;
  passwordHash: string;
  name?: string;
  roles?: Role[];
}

type UserWithRelations = User & {
  roles: { role: Role }[];
  tier: { id: string; name: string; priority: number } | null;
};

const userInclude = {
  roles: true,
  tier: true,
} as const;

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
      include: userInclude,
    });

    return this.sanitize(user);
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      include: userInclude,
      orderBy: { createdAt: 'asc' },
    });

    return users
      .filter((user) =>
        user.roles.every((item) => item.role !== Role.SUPER_ADMIN),
      )
      .map((user) => this.sanitize(user));
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: userInclude,
    });

    return user ? this.sanitize(user) : null;
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: userInclude,
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
      include: userInclude,
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
      include: userInclude,
    });

    return this.sanitize(user);
  }

  async assignTier(id: string, tierId: string | null) {
    await this.getUserOrThrow(id);

    if (tierId !== null) {
      const tier = await this.prisma.tier.findUnique({
        where: { id: tierId },
      });

      if (!tier) {
        throw new BadRequestException('Tier not found');
      }
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: { tierId },
      include: userInclude,
    });

    return this.sanitize(user);
  }

  async remove(id: string) {
    const user = await this.prisma.user.delete({
      where: { id },
      include: userInclude,
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

  private sanitize(user: UserWithRelations): SafeUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      status: user.status,
      roles: user.roles.map((item) => item.role),
      tierId: user.tierId,
      tier: user.tier,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
