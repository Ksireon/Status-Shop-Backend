import { Module } from '@nestjs/common';
import { ProductsAdminController } from './products.admin.controller';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  controllers: [ProductsController, ProductsAdminController],
  providers: [ProductsService],
})
export class ProductsModule {}
