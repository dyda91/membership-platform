import {
  Body,
  Controller,
  Delete,
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
import { TiersService } from './tiers.service';
import { CreateTierDto } from './dto/create-tier.dto';
import { UpdateTierDto } from './dto/update-tier.dto';

@UseGuards(JwtAuthGuard)
@Controller('tiers')
export class TiersController {
  constructor(private readonly tiersService: TiersService) {}

  @Get()
  findAll() {
    return this.tiersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tiersService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ARTIST)
  create(@Body() createTierDto: CreateTierDto) {
    return this.tiersService.create(createTierDto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ARTIST)
  update(@Param('id') id: string, @Body() updateTierDto: UpdateTierDto) {
    return this.tiersService.update(id, updateTierDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ARTIST)
  remove(@Param('id') id: string) {
    return this.tiersService.remove(id);
  }
}
