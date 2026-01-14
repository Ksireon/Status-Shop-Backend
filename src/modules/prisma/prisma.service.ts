import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly pool: pg.Pool;

  constructor(config: ConfigService) {
    const connectionString = config.getOrThrow<string>('DATABASE_URL');
    const pool = new pg.Pool({
      connectionString,
      max: Number(config.get<string>('PG_POOL_MAX') || 10),
      idleTimeoutMillis: Number(
        config.get<string>('PG_POOL_IDLE_MS') || 30_000,
      ),
      connectionTimeoutMillis: Number(
        config.get<string>('PG_POOL_CONN_TIMEOUT_MS') || 5_000,
      ),
    });
    super({ adapter: new PrismaPg(pool) });
    this.pool = pool;
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end();
  }
}
