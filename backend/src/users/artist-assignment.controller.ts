import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { UsersService } from './users.service';
import type { UserActor } from './users.service';
import { AssignArtistDto } from './dto/assign-artist.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN)
@Controller('system/artist')
export class ArtistAssignmentController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getArtistState() {
    return this.usersService.getActiveArtist();
  }

  @Get('candidates')
  getArtistCandidates() {
    return this.usersService.getArtistCandidates();
  }

  @Post('promote')
  promote(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: AssignArtistDto,
  ) {
    return this.usersService.promoteToArtist(dto.userId, this.toActor(user));
  }

  @Post('replace')
  replace(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: AssignArtistDto,
  ) {
    return this.usersService.replaceArtist(dto.userId, this.toActor(user));
  }

  private toActor(user: AuthenticatedUser): UserActor {
    return { id: user.id, roles: user.roles };
  }
}
