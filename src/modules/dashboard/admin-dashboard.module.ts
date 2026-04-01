import { Module } from '@nestjs/common';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AdminDashboardController } from './admin-dashboard.controller';
import { AdminDashboardService } from './admin-dashboard.service';

@Module({
  controllers: [AdminDashboardController],
  providers: [AdminDashboardService, RolesGuard],
})
export class AdminDashboardModule {}
