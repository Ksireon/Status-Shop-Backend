import { Module } from '@nestjs/common'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { APP_GUARD } from '@nestjs/core'
import { ConfigModule } from './config/config.module'
import { SupabaseModule } from './supabase/supabase.module'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { CartModule } from './cart/cart.module'
import { OrdersModule } from './orders/orders.module'
import { ProductsModule } from './products/products.module'
import { HealthModule } from './health/health.module'
import { BranchesModule } from './branches/branches.module'
import { SystemModule } from './system/system.module'
import { ChatModule } from './chat/chat.module'

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
    ConfigModule,
    SupabaseModule,
    AuthModule,
    UsersModule,
    CartModule,
    OrdersModule,
    ProductsModule,
    HealthModule,
    BranchesModule,
    SystemModule,
    ChatModule
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }]
})
export class AppModule {}
