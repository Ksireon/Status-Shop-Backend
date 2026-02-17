import {
  Body,
  Controller,
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
import { AdminSupportService } from './admin-support.service';
import { AdminListSupportThreadsQuery } from './dto/admin-list-support-threads.query';
import { AdminSendSupportMessageDto } from './dto/admin-send-support-message.dto';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.MANAGER)
@Controller('admin/support')
export class AdminSupportController {
  constructor(private readonly adminSupport: AdminSupportService) {}

  @Get('threads')
  listThreads(@Query() query: AdminListSupportThreadsQuery) {
    return this.adminSupport.listThreads(query);
  }

  @Get('threads/:id')
  getThread(@Param('id') id: string) {
    return this.adminSupport.getThread(id);
  }

  @Post('threads/:id/messages')
  sendMessage(
    @Param('id') id: string,
    @Body() dto: AdminSendSupportMessageDto,
  ) {
    return this.adminSupport.sendSupportMessage(id, dto.text);
  }

  @Patch('threads/:id/close')
  close(@Param('id') id: string) {
    return this.adminSupport.closeThread(id);
  }
}
