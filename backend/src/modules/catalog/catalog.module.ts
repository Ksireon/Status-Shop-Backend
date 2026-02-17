import { Module } from '@nestjs/common';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { AdminCatalogController } from './admin-catalog.controller';
import { AdminCatalogService } from './admin-catalog.service';
import { RolesGuard } from '../../common/guards/roles.guard';

@Module({
  controllers: [CatalogController, AdminCatalogController],
  providers: [CatalogService, AdminCatalogService, RolesGuard],
})
export class CatalogModule {}
