import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { TierAccessService } from './tier-access.service';
import { TierAccessAdminService } from './tier-access-admin.service';
import type { TierAccessActor } from './tier-access.service';
import { GrantTierAccessDto } from './dto/grant-tier-access.dto';
import { RenewTierAccessDto } from './dto/renew-tier-access.dto';
import { UpdateTierAccessDto } from './dto/update-tier-access.dto';
import { RevokeTierAccessDto } from './dto/revoke-tier-access.dto';

@UseGuards(JwtAuthGuard)
@Controller('users/:userId/tier-access')
export class TierAccessController {
  constructor(
    private readonly tierAccessService: TierAccessService,
    private readonly tierAccessAdminService: TierAccessAdminService,
  ) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ARTIST)
  getCurrentAccess(@Param('userId') userId: string) {
    return this.tierAccessService.getEffectiveAccess(userId);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ARTIST)
  grant(
    @CurrentUser() user: AuthenticatedUser,
    @Param('userId') userId: string,
    @Body() dto: GrantTierAccessDto,
  ) {
    return this.tierAccessAdminService.grant(this.toActor(user), userId, {
      tierId: dto.tierId,
      startsAt: dto.startsAt,
      expiresAt: dto.permanent ? null : (dto.expiresAt ?? null),
      permanent: dto.permanent ?? false,
      internalNote: dto.internalNote,
    });
  }

  @Post('renew')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ARTIST)
  renew(
    @CurrentUser() user: AuthenticatedUser,
    @Param('userId') userId: string,
    @Body() dto: RenewTierAccessDto,
  ) {
    return this.tierAccessAdminService.renew(this.toActor(user), userId, {
      expiresAt: dto.expiresAt,
      permanent: dto.permanent ?? false,
      internalNote: dto.internalNote,
    });
  }

  @Patch()
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ARTIST)
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('userId') userId: string,
    @Body() dto: UpdateTierAccessDto,
  ) {
    return this.tierAccessAdminService.update(this.toActor(user), userId, {
      tierId: dto.tierId,
      startsAt: dto.startsAt,
      expiresAt: dto.expiresAt,
      permanent: dto.permanent,
      internalNote: dto.internalNote,
    });
  }

  @Post('revoke')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ARTIST)
  revoke(
    @CurrentUser() user: AuthenticatedUser,
    @Param('userId') userId: string,
    @Body() dto: RevokeTierAccessDto,
  ) {
    return this.tierAccessAdminService.revoke(
      this.toActor(user),
      userId,
      dto.internalNote,
    );
  }

  @Get('history')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ARTIST)
  history(@Param('userId') userId: string) {
    return this.tierAccessAdminService.getHistory(userId);
  }

  private toActor(user: AuthenticatedUser): TierAccessActor {
    return { id: user.id, roles: user.roles };
  }
}
