import { Module } from '@nestjs/common'
import { SystemService } from './system.service'
import { SystemController } from './system.controller'
import { ConfigModule } from '../config/config.module'
import { SupabaseModule } from '../supabase/supabase.module'

@Module({
  imports: [ConfigModule, SupabaseModule],
  providers: [SystemService],
  controllers: [SystemController],
})
export class SystemModule {}

