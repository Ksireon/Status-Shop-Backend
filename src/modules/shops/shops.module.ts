import { Module } from '@nestjs/common';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AdminShopsController } from './admin-shops.controller';
import { AdminShopsService } from './admin-shops.service';
import { ShopsController } from './shops.controller';
import { ShopsService } from './shops.service';

@Module({
  controllers: [ShopsController, AdminShopsController],
  providers: [ShopsService, AdminShopsService, RolesGuard],
})
export class ShopsModule {}
