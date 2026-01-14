import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import type { JwtUser } from '../../common/auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateMeDto } from './dto/update-me.dto';
import { UserDto } from './dto/user.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  async me(@CurrentUser() user: JwtUser): Promise<UserDto> {
    return this.users.getMe(user.sub);
  }

  @Patch('me')
  async updateMe(@CurrentUser() user: JwtUser, @Body() dto: UpdateMeDto): Promise<UserDto> {
    return this.users.updateMe(user.sub, dto);
  }
}
