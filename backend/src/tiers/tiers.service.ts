import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  findAll() {
    return this.prisma.tier.findMany({ orderBy: { priority: 'asc' } });
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

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.tier.delete({ where: { id } });
  }
}
