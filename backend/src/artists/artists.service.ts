import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';

@Injectable()
export class ArtistsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createArtistDto: CreateArtistDto) {
    return this.prisma.artist.create({ data: createArtistDto });
  }

  findAll() {
    return this.prisma.artist.findMany();
  }

  findOne(id: string) {
    return this.prisma.artist.findUnique({ where: { id } });
  }

  findByUserId(userId: string) {
    return this.prisma.artist.findUnique({ where: { userId } });
  }

  update(id: string, updateArtistDto: UpdateArtistDto) {
    return this.prisma.artist.update({
      where: { id },
      data: updateArtistDto,
    });
  }

  remove(id: string) {
    return this.prisma.artist.delete({ where: { id } });
  }

  async getProfile(userId: string) {
    const profile = await this.prisma.artist.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Artist profile not found');
    }

    return profile;
  }

  async updateProfile(userId: string, updateArtistDto: UpdateArtistDto) {
    const profile = await this.prisma.artist.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new UnauthorizedException(
        'Artist profile does not exist for this user',
      );
    }

    return this.prisma.artist.update({
      where: { userId },
      data: {
        name: updateArtistDto.name,
        description: updateArtistDto.description,
        bio: updateArtistDto.bio,
        avatarUrl: updateArtistDto.avatarUrl,
        bannerUrl: updateArtistDto.bannerUrl,
      },
    });
  }
}
