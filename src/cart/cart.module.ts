import { Module } from '@nestjs/common'
import { SupabaseModule } from '../supabase/supabase.module'
import { ConfigModule } from '../config/config.module'
import { CartService } from './cart.service'
import { CartController } from './cart.controller'

@Module({ imports: [SupabaseModule, ConfigModule], providers: [CartService], controllers: [CartController] })
export class CartModule {}
