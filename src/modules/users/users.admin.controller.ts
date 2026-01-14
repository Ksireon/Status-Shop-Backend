import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import type { JwtUser } from '../../common/auth/current-user.decorator';
import { Roles } from '../../common/auth/roles.decorator';
import { RolesGuard } from '../../common/auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminCreateUserDto } from './dto/admin-create-user.dto';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { UserFilterDto } from './dto/user-filter.dto';
import { UsersService } from './users.service';

@ApiTags('admin/users')
@ApiBearerAuth()
@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MANAGER)
export class UsersAdminController {
  constructor(private readonly users: UsersService) {}

  @Get()
  async list(@Query() filter: UserFilterDto) {
    return this.users.adminList(filter);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.users.adminGet(id);
  }

  @Patch(':id')
  async update(
    @CurrentUser() current: JwtUser,
    @Param('id') id: string,
    @Body() dto: AdminUpdateUserDto,
  ) {
    return this.users.adminUpdate(current, id, dto);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  async create(
    @CurrentUser() current: JwtUser,
    @Body() dto: AdminCreateUserDto,
  ) {
    return this.users.adminCreate(current, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async deactivate(@Param('id') id: string) {
    return this.users.adminDeactivate(id);
  }
}
