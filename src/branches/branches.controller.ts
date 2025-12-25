import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { BranchesService } from './branches.service'

@ApiTags('branches')
@Controller('branches')
export class BranchesController {
  constructor(private readonly service: BranchesService) {}

  @Get()
  list() {
    return this.service.list()
  }
}
