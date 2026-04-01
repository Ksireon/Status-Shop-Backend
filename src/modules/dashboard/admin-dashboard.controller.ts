import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { JwtPayload } from '../../common/types/jwt-payload';
import { UserRole } from '../../common/constants/user-role';
import { AdminDashboardService } from './admin-dashboard.service';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.MANAGER)
@Controller('admin/dashboard')
export class AdminDashboardController {
  constructor(private readonly dashboard: AdminDashboardService) {}

  @Get('stats')
  getStats(@CurrentUser() user: JwtPayload) {
    return this.dashboard.getStats(user);
  }
}
