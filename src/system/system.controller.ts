import { Controller, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { SystemService } from './system.service'

@ApiTags('system')
@Controller('system')
export class SystemController {
  constructor(private readonly service: SystemService) {}
  @Post('init-branches')
  initBranches() {
    return this.service.ensureBranchesTable()
  }
}

