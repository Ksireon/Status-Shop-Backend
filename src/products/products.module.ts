import { Module } from '@nestjs/common'
import { SupabaseModule } from '../supabase/supabase.module'
import { ProductsService } from './products.service'
import { ProductsController } from './products.controller'

@Module({ imports: [SupabaseModule], providers: [ProductsService], controllers: [ProductsController] })
export class ProductsModule {}
