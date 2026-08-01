import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AccountStatus, Role, User } from '@prisma/client';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateOwnProfileDto } from './dto/update-own-profile.dto';
import {
  DEFAULT_PAGE_SIZE,
  ListUsersQueryDto,
} from './dto/list-users-query.dto';

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

  async findAll(query: ListUsersQueryDto = {}) {
    const page = query.page ?? 1;
    const limit = query.limit ?? DEFAULT_PAGE_SIZE;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      roles: { none: { role: HIDDEN_ROLE } },
    };

    const search = query.search?.trim();

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (query.tierId) {
      where.tierId = query.tierId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.role && query.role !== Role.SUPER_ADMIN) {
      where.roles = { some: { role: query.role } };
    }

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        include: userInclude,
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    return {
      data: users.map((user) => this.sanitize(user)),
      page,
      limit,
      total,
      totalPages,
    };
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

  /**
   * Promotes an eligible account to the ARTIST role.
   * Only SUPER_ADMIN may promote, and at most one active ARTIST may exist.
   * Runs inside a transaction guarded by a database-level partial unique index.
   */
  async promoteToArtist(id: string, actor?: UserActor) {
    if (!actor || !actor.roles.includes(Role.SUPER_ADMIN)) {
      throw new ForbiddenException(
        'Only SUPER_ADMIN can assign the ARTIST role',
      );
    }

    const target = await this.prisma.user.findUnique({
      where: { id },
      include: userInclude,
    });

    if (!target) {
      throw new NotFoundException('User not found');
    }

    if (this.isHidden(target)) {
      throw new BadRequestException('Hidden system accounts cannot be artists');
    }

    if (target.status !== AccountStatus.ACTIVE) {
      throw new BadRequestException('Only active accounts can be artists');
    }

    const existingArtist = await this.prisma.user.findFirst({
      where: { roles: { some: { role: Role.ARTIST } } },
      select: { id: true },
    });

    if (existingArtist) {
      throw new ConflictException(
        'An active artist already exists. Use replacement instead.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.userRole.upsert({
        where: { userId_role: { userId: id, role: Role.ARTIST } },
        create: { userId: id, role: Role.ARTIST },
        update: {},
      });

      // Ensure the promoted account has a public artist profile record.
      await tx.artist.upsert({
        where: { userId: id },
        create: {
          userId: id,
          name: target.name ?? 'Artist',
          description: '',
        },
        update: {},
      });

      return this.findOne(id, actor);
    });
  }

  /**
   * Atomically replaces the active artist with an eligible replacement account.
   * Exactly one active ARTIST exists after the operation. Public posts, tiers,
   * media and the artist page remain preserved.
   */
  async replaceArtist(replacementId: string, actor?: UserActor) {
    if (!actor || !actor.roles.includes(Role.SUPER_ADMIN)) {
      throw new ForbiddenException('Only SUPER_ADMIN can replace the artist');
    }

    const replacement = await this.prisma.user.findUnique({
      where: { id: replacementId },
      include: userInclude,
    });

    if (!replacement) {
      throw new NotFoundException('Replacement user not found');
    }

    if (this.isHidden(replacement)) {
      throw new BadRequestException('Hidden system accounts cannot be artists');
    }

    if (replacement.status !== AccountStatus.ACTIVE) {
      throw new BadRequestException('Only active accounts can be artists');
    }

    if (replacement.roles.some((item) => item.role === Role.ARTIST)) {
      throw new ConflictException(
        'The replacement account is already an artist',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const previousArtist = await tx.user.findFirst({
        where: { roles: { some: { role: Role.ARTIST } } },
        include: userInclude,
      });

      if (previousArtist) {
        await tx.userRole.deleteMany({
          where: {
            userId: previousArtist.id,
            role: Role.ARTIST,
          },
        });
      }

      await tx.userRole.upsert({
        where: { userId_role: { userId: replacementId, role: Role.ARTIST } },
        create: { userId: replacementId, role: Role.ARTIST },
        update: {},
      });

      // Transfer the singleton public artist page to the replacement account,
      // preserving its configured public data, media and contacts.
      const previousArtistRecord = previousArtist
        ? await tx.artist.findUnique({
            where: { userId: previousArtist.id },
            select: { id: true },
          })
        : null;

      if (previousArtistRecord) {
        await tx.artist.update({
          where: { id: previousArtistRecord.id },
          data: { userId: replacementId },
        });
      } else {
        await tx.artist.upsert({
          where: { userId: replacementId },
          create: {
            userId: replacementId,
            name: replacement.name ?? 'Artist',
            description: '',
          },
          update: {},
        });
      }

      return this.findOne(replacementId, actor);
    });
  }

  /**
   * Returns the single active artist account, or null when none exists.
   */
  async getActiveArtist() {
    const artist = await this.prisma.user.findFirst({
      where: { roles: { some: { role: Role.ARTIST } } },
      include: userInclude,
    });

    return artist ? this.sanitize(artist) : null;
  }

  /**
   * Returns eligible non-hidden accounts that may be promoted to ARTIST.
   * Excludes SUPER_ADMIN, existing ARTIST accounts and non-active accounts.
   */
  async getArtistCandidates() {
    const users = await this.prisma.user.findMany({
      where: {
        status: AccountStatus.ACTIVE,
        roles: {
          none: {
            role: { in: [Role.SUPER_ADMIN, Role.ARTIST] },
          },
        },
      },
      include: userInclude,
      orderBy: { createdAt: 'asc' },
    });

    return users.map((user) => this.sanitize(user));
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
