import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AccountStatus, Role, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateOwnProfileDto } from './dto/update-own-profile.dto';

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

export interface UserActor {
  id: string;
  roles: Role[];
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

const HIDDEN_ROLE = Role.SUPER_ADMIN;

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
      where: {
        roles: { none: { role: HIDDEN_ROLE } },
      },
      include: userInclude,
      orderBy: { createdAt: 'asc' },
    });

    return users.map((user) => this.sanitize(user));
  }

  async findOne(id: string, actor?: UserActor) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: userInclude,
    });

    if (!user) {
      return null;
    }

    if (this.isHidden(user) && !this.isSuperAdmin(actor)) {
      return null;
    }

    return this.sanitize(user);
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: userInclude,
    });
  }

  async getProfile(id: string, actor?: UserActor) {
    const user = await this.getUserOrThrow(id, actor);

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto, actor?: UserActor) {
    const user = await this.getUserOrThrow(id, actor);

    this.assertCanModify(actor, user);

    const updated = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      include: userInclude,
    });

    return this.sanitize(updated);
  }

  async updateOwnProfile(id: string, dto: UpdateOwnProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: userInclude,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        name: dto.name,
      },
      include: userInclude,
    });

    return this.sanitize(updated);
  }

  async assignRole(id: string, role: Role, actor?: UserActor) {
    const user = await this.getUserOrThrow(id, actor);

    this.assertCanModify(actor, user);
    this.assertCanAssignRole(actor, role);

    await this.prisma.userRole.upsert({
      where: { userId_role: { userId: id, role } },
      create: { userId: id, role },
      update: {},
    });

    return this.findOne(id, actor);
  }

  async removeRole(id: string, role: Role, actor?: UserActor) {
    const user = await this.getUserOrThrow(id, actor);

    this.assertCanModify(actor, user);

    try {
      await this.prisma.userRole.delete({
        where: { userId_role: { userId: id, role } },
      });
    } catch {
      throw new ConflictException('Role is not assigned to this user');
    }

    return this.findOne(id, actor);
  }

  async setStatus(id: string, status: AccountStatus, actor?: UserActor) {
    const user = await this.getUserOrThrow(id, actor);

    this.assertCanModify(actor, user);

    const updated = await this.prisma.user.update({
      where: { id },
      data: { status },
      include: userInclude,
    });

    return this.sanitize(updated);
  }

  async assignTier(id: string, tierId: string | null, actor?: UserActor) {
    const user = await this.getUserOrThrow(id, actor);

    this.assertCanModify(actor, user);

    if (tierId !== null) {
      const tier = await this.prisma.tier.findUnique({
        where: { id: tierId },
      });

      if (!tier) {
        throw new BadRequestException('Tier not found');
      }
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { tierId },
      include: userInclude,
    });

    return this.sanitize(updated);
  }

  async remove(id: string, actor?: UserActor) {
    const user = await this.getUserOrThrow(id, actor);

    this.assertCanModify(actor, user);

    const deleted = await this.prisma.user.delete({
      where: { id },
      include: userInclude,
    });

    return this.sanitize(deleted);
  }

  private async getUserOrThrow(
    id: string,
    actor?: UserActor,
  ): Promise<SafeUser> {
    const user = await this.findOne(id, actor);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  private isHidden(user: UserWithRelations): boolean {
    return user.roles.some((item) => item.role === HIDDEN_ROLE);
  }

  private isSuperAdmin(actor?: UserActor): boolean {
    return actor?.roles.includes(Role.SUPER_ADMIN) ?? false;
  }

  private assertCanModify(actor: UserActor | undefined, user: SafeUser) {
    if (!actor) {
      throw new ForbiddenException('Actor required');
    }

    const targetIsHidden = user.roles.includes(HIDDEN_ROLE);

    if (targetIsHidden && !this.isSuperAdmin(actor)) {
      throw new NotFoundException('User not found');
    }
  }

  private assertCanAssignRole(actor: UserActor | undefined, role: Role) {
    if (!actor) {
      throw new ForbiddenException('Actor required');
    }

    const isSuperAdmin = this.isSuperAdmin(actor);
    const privilegedRoles: Role[] = [Role.SUPER_ADMIN, Role.ARTIST];

    if (privilegedRoles.includes(role) && !isSuperAdmin) {
      throw new ForbiddenException(
        'Only SUPER_ADMIN can assign privileged roles',
      );
    }

    if (role === Role.SUPER_ADMIN) {
      throw new ForbiddenException('SUPER_ADMIN role cannot be assigned');
    }
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
