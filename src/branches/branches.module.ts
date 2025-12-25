import { Module } from '@nestjs/common'
import { SupabaseModule } from '../supabase/supabase.module'
import { BranchesService } from './branches.service'
import { BranchesController } from './branches.controller'

@Module({
  imports: [SupabaseModule],
  providers: [BranchesService],
  controllers: [BranchesController]
})
export class BranchesModule {}
