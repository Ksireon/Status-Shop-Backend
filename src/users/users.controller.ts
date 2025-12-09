import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { UsersService } from './users.service'
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard'
import { UpdateUserDto } from './dto/update-user.dto'

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get(':uid')
  get(@Param('uid') uid: string) {
    return this.service.get(uid)
  }

  @Patch(':uid')
  update(@Param('uid') uid: string, @Body() dto: UpdateUserDto) {
    return this.service.update(uid, dto)
  }
}
