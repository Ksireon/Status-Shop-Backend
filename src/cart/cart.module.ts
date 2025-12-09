import { Module } from '@nestjs/common'
import { SupabaseModule } from '../supabase/supabase.module'
import { CartService } from './cart.service'
import { CartController } from './cart.controller'

@Module({ imports: [SupabaseModule], providers: [CartService], controllers: [CartController] })
export class CartModule {}
