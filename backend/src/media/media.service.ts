import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';

@Injectable()
export class MediaService {
  constructor(private readonly prisma: PrismaService) {}

  create(createMediaDto: CreateMediaDto) {
    return this.prisma.media.create({ data: createMediaDto });
  }

  findAll() {
    return this.prisma.media.findMany();
  }

  findOne(id: string) {
    return this.prisma.media.findUnique({ where: { id } });
  }

  findByPost(postId: string) {
    return this.prisma.media.findMany({ where: { postId } });
  }

  update(id: string, updateMediaDto: UpdateMediaDto) {
    return this.prisma.media.update({ where: { id }, data: updateMediaDto });
  }

  remove(id: string) {
    return this.prisma.media.delete({ where: { id } });
  }
}
