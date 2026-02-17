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
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../common/constants/user-role';
import { AdminUsersService } from './admin-users.service';
import { AdminCreateUserDto } from './dto/admin-create-user.dto';
import { AdminListUsersQuery } from './dto/admin-list-users.query';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER)
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly adminUsers: AdminUsersService) {}

  @Get()
  list(@Query() query: AdminListUsersQuery) {
    return this.adminUsers.list(query);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.adminUsers.get(id);
  }

  @Post()
  create(@Body() dto: AdminCreateUserDto) {
    return this.adminUsers.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: AdminUpdateUserDto) {
    return this.adminUsers.update(id, dto);
  }

  @Delete(':id')
  deactivate(@Param('id') id: string) {
    return this.adminUsers.deactivate(id);
  }
}
