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
<<<<<<< HEAD
import { SystemModule } from './system/system.module'
=======
import { BranchesModule } from './branches/branches.module'
import { CategoriesModule } from './categories/categories.module'
import { SettingsModule } from './settings/settings.module'
>>>>>>> 201d046b37daf4793c8f1eb0498a970ad213f00b

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
<<<<<<< HEAD
    SystemModule
=======
    BranchesModule,
    CategoriesModule,
    SettingsModule
>>>>>>> 201d046b37daf4793c8f1eb0498a970ad213f00b
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }]
})
export class AppModule {}
