import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { ProductsModule } from './modules/products/products.module';
import { ShopsModule } from './modules/shops/shops.module';
import { SupportModule } from './modules/support/support.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: (raw: Record<string, unknown>) => {
        const nodeEnv = getEnvString(raw, 'NODE_ENV') || 'development';

        const databaseUrl = getEnvString(raw, 'DATABASE_URL');
        if (!databaseUrl) throw new Error('DATABASE_URL is required');

        const jwtSecret = getEnvString(raw, 'JWT_SECRET');
        if (!jwtSecret) throw new Error('JWT_SECRET is required');

        const refreshSecret = getEnvString(raw, 'REFRESH_TOKEN_SECRET');

        if (nodeEnv === 'production') {
          const weak = new Set(['change-me-in-production', 'change-me']);
          if (jwtSecret.length < 32 || weak.has(jwtSecret)) {
            throw new Error('JWT_SECRET is too weak for production');
          }
          if (
            refreshSecret &&
            (refreshSecret.length < 32 || weak.has(refreshSecret))
          ) {
            throw new Error('REFRESH_TOKEN_SECRET is too weak for production');
          }
        }

        return raw;
      },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 120,
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    ProductsModule,
    ShopsModule,
    OrdersModule,
    SupportModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

function getEnvString(
  env: Record<string, unknown>,
  key: string,
): string | undefined {
  const v = env[key];
  if (typeof v !== 'string') return undefined;
  const t = v.trim();
  return t.length === 0 ? undefined : t;
}
