import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { MediaService } from './media.service';
import { UploadMediaDto } from './dto/upload-media.dto';
import { AssociateMediaDto } from './dto/associate-media.dto';
import type { UploadFile } from '../common/upload-file.type';
import { MAX_VIDEO_SIZE } from '../storage/storage.service';

@UseGuards(JwtAuthGuard)
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ARTIST)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_VIDEO_SIZE },
    }),
  )
  upload(
    @UploadedFile() file: UploadFile,
    @Body() uploadMediaDto: UploadMediaDto,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.mediaService.upload(file, uploadMediaDto.postId);
  }

  @Post(':id/associate')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ARTIST)
  associate(
    @Param('id') id: string,
    @Body() associateMediaDto: AssociateMediaDto,
  ) {
    return this.mediaService.associate(associateMediaDto.postId, id);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ARTIST)
  findAll(@Query('postId') postId?: string) {
    if (postId) {
      return this.mediaService.findByPost(postId);
    }

    return this.mediaService.findAll();
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ARTIST)
  findOne(@Param('id') id: string) {
    return this.mediaService.findOne(id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ARTIST)
  remove(@Param('id') id: string) {
    return this.mediaService.remove(id);
  }
}
