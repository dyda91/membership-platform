import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { MediaService } from './media.service';
import { UploadMediaDto } from './dto/upload-media.dto';
import { AssociateMediaDto } from './dto/associate-media.dto';
import { ReorderMediaDto } from './dto/reorder-media.dto';
import type { UploadFile } from '../common/upload-file.type';
import type { ContentViewer } from '../common/content-access.util';
import { MAX_VIDEO_SIZE } from '../storage/storage.service';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ARTIST)
  associate(
    @Param('id') id: string,
    @Body() associateMediaDto: AssociateMediaDto,
  ) {
    return this.mediaService.associate(associateMediaDto.postId, id);
  }

  @Patch('reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ARTIST)
  reorder(@Body() reorderMediaDto: ReorderMediaDto) {
    return this.mediaService.reorder(
      reorderMediaDto.postId,
      reorderMediaDto.mediaIds,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ARTIST)
  findAll(@Query('postId') postId?: string) {
    if (postId) {
      return this.mediaService.findByPost(postId);
    }

    return this.mediaService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ARTIST)
  findOne(@Param('id') id: string) {
    return this.mediaService.findOne(id);
  }

  @Get(':id/file')
  @UseGuards(OptionalJwtAuthGuard)
  @Header('Content-Disposition', 'inline')
  async getFile(
    @CurrentUser() user: AuthenticatedUser | null,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const viewer: ContentViewer | null = user
      ? {
          roles: user.roles,
          tierPriority: user.tier?.priority ?? null,
        }
      : null;

    const file = await this.mediaService.getFile(id, viewer);

    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Length', file.buffer.length);
    res.setHeader('Cache-Control', 'private, max-age=3600');

    return res.send(file.buffer);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ARTIST)
  remove(@Param('id') id: string) {
    return this.mediaService.remove(id);
  }
}
