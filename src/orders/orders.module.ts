import { Module } from '@nestjs/common'
import { SupabaseModule } from '../supabase/supabase.module'
import { OrdersService } from './orders.service'
import { OrdersController } from './orders.controller'
import { CartModule } from '../cart/cart.module'

@Module({ imports: [SupabaseModule, CartModule], providers: [OrdersService], controllers: [OrdersController] })
export class OrdersModule {}
