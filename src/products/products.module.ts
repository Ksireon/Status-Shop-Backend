import { Module } from '@nestjs/common'
import { SupabaseModule } from '../supabase/supabase.module'
import { ProductsService } from './products.service'
import { ProductsController } from './products.controller'
import { ProductsUploadsController } from './uploads.controller'

@Module({ imports: [SupabaseModule], providers: [ProductsService], controllers: [ProductsController, ProductsUploadsController] })
export class ProductsModule {}
