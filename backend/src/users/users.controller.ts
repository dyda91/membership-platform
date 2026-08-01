import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseEnumPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { UsersService } from './users.service';
import type { UserActor } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { AssignTierDto } from './dto/assign-tier.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.ARTIST)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    const result = await this.usersService.findOne(id, this.toActor(user));

    if (!result) {
      throw new NotFoundException('User not found');
    }

    return result;
  }

  @Get(':id/profile')
  getProfile(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.usersService.getProfile(id, this.toActor(user));
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto, this.toActor(user));
  }

  @Post(':id/roles')
  assignRole(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() assignRoleDto: AssignRoleDto,
  ) {
    return this.usersService.assignRole(
      id,
      assignRoleDto.role,
      this.toActor(user),
    );
  }

  @Delete(':id/roles/:role')
  removeRole(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Param('role', new ParseEnumPipe(Role)) role: Role,
  ) {
    return this.usersService.removeRole(id, role, this.toActor(user));
  }

  @Patch(':id/status')
  setStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStatusDto,
  ) {
    return this.usersService.setStatus(
      id,
      updateStatusDto.status,
      this.toActor(user),
    );
  }

  @Patch(':id/tier')
  assignTier(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() assignTierDto: AssignTierDto,
  ) {
    return this.usersService.assignTier(
      id,
      assignTierDto.tierId ?? null,
      this.toActor(user),
    );
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.usersService.remove(id, this.toActor(user));
  }

  private toActor(user: AuthenticatedUser): UserActor {
    return { id: user.id, roles: user.roles };
  }
}
