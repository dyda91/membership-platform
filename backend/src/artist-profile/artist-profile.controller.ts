import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role } from '@prisma/client';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { ArtistProfileService } from './artist-profile.service';
import type { ArtistProfileActor } from './artist-profile.service';
import { UpdateArtistProfileDto } from './dto/update-artist-profile.dto';
import type { UploadFile } from '../common/upload-file.type';
import { MAX_IMAGE_SIZE } from '../storage/storage.service';

@Controller('artist-profile')
export class ArtistProfileController {
  constructor(private readonly artistProfileService: ArtistProfileService) {}

  @Get('public')
  @UseGuards(OptionalJwtAuthGuard)
  getPublicProfile() {
    return this.artistProfileService.getPublicProfile();
  }

  @Get('manage')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ARTIST)
  getManageProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.artistProfileService.getManageProfile(this.toActor(user));
  }

  @Patch()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ARTIST)
  updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateArtistProfileDto,
  ) {
    return this.artistProfileService.updateProfile(this.toActor(user), dto);
  }

  @Post('avatar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ARTIST)
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: MAX_IMAGE_SIZE } }),
  )
  uploadAvatar(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file: UploadFile | undefined,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.artistProfileService.uploadAvatar(this.toActor(user), file);
  }

  @Post('banner')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ARTIST)
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: MAX_IMAGE_SIZE } }),
  )
  uploadBanner(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file: UploadFile | undefined,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.artistProfileService.uploadBanner(this.toActor(user), file);
  }

  private toActor(user: AuthenticatedUser): ArtistProfileActor {
    return { id: user.id, roles: user.roles };
  }
}
