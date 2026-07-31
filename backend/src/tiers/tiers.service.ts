import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTierDto } from './dto/create-tier.dto';
import { UpdateTierDto } from './dto/update-tier.dto';

@Injectable()
export class TiersService {
  constructor(private readonly prisma: PrismaService) {}

  create(createTierDto: CreateTierDto) {
    return this.prisma.tier.create({ data: createTierDto });
  }

  findAll() {
    return this.prisma.tier.findMany();
  }

  findOne(id: string) {
    return this.prisma.tier.findUnique({ where: { id } });
  }

  findByArtist(artistId: string) {
    return this.prisma.tier.findMany({ where: { artistId } });
  }

  update(id: string, updateTierDto: UpdateTierDto) {
    return this.prisma.tier.update({ where: { id }, data: updateTierDto });
  }

  remove(id: string) {
    return this.prisma.tier.delete({ where: { id } });
  }
}
