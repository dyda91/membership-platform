import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTierDto } from './dto/create-tier.dto';
import { UpdateTierDto } from './dto/update-tier.dto';

@Injectable()
export class TiersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTierDto: CreateTierDto) {
    try {
      return await this.prisma.tier.create({ data: createTierDto });
    } catch {
      throw new ConflictException('A tier with this name already exists');
    }
  }

  /**
   * Returns tiers ordered by priority with safe usage counts so the
   * administration interface can show current members, posts and references.
   */
  findAll() {
    return this.prisma.tier.findMany({
      orderBy: { priority: 'asc' },
      include: {
        _count: {
          select: {
            users: true,
            posts: true,
            tierAccessAssignments: true,
            tierAccessEventsPrev: true,
            tierAccessEventsNew: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const tier = await this.prisma.tier.findUnique({ where: { id } });

    if (!tier) {
      throw new NotFoundException('Tier not found');
    }

    return tier;
  }

  async update(id: string, updateTierDto: UpdateTierDto) {
    await this.findOne(id);

    try {
      return await this.prisma.tier.update({
        where: { id },
        data: updateTierDto,
      });
    } catch {
      throw new ConflictException('A tier with this name already exists');
    }
  }

  /**
   * Deletes a tier only when it is no longer referenced. Returns a clear
   * conflict message when members, posts or access history still reference it,
   * and guards against database-level constraint errors as a safety net.
   */
  async remove(id: string) {
    await this.findOne(id);

    const [userCount, postCount, assignmentCount, historyCount] =
      await this.prisma.$transaction([
        this.prisma.user.count({ where: { tierId: id } }),
        this.prisma.post.count({ where: { tierId: id } }),
        this.prisma.tierAccessAssignment.count({ where: { tierId: id } }),
        this.prisma.tierAccessEvent.count({
          where: { OR: [{ previousTierId: id }, { newTierId: id }] },
        }),
      ]);

    if (
      userCount > 0 ||
      postCount > 0 ||
      assignmentCount > 0 ||
      historyCount > 0
    ) {
      const references: string[] = [];

      if (userCount > 0) {
        references.push(`${userCount} membro(s)`);
      }

      if (postCount > 0) {
        references.push(`${postCount} post(s)`);
      }

      if (assignmentCount > 0) {
        references.push(`${assignmentCount} atribuição(ões)`);
      }

      if (historyCount > 0) {
        references.push(`${historyCount} evento(s) de histórico`);
      }

      throw new BadRequestException(
        `Este tier não pode ser excluído porque está em uso por ${references.join(', ')}.`,
      );
    }

    try {
      return await this.prisma.tier.delete({ where: { id } });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new BadRequestException(
          'Este tier não pode ser excluído porque ainda está em uso.',
        );
      }

      throw error;
    }
  }
}
