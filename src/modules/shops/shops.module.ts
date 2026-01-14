import { Module } from '@nestjs/common';
import { ShopsAdminController } from './shops.admin.controller';
import { ShopsController } from './shops.controller';
import { ShopsService } from './shops.service';

@Module({
  controllers: [ShopsController, ShopsAdminController],
  providers: [ShopsService],
})
export class ShopsModule {}
