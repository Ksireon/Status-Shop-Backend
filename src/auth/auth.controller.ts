import { Body, Controller, Get, Headers, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { RefreshDto } from './dto/refresh.dto'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.service.register(dto)
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.service.login(dto)
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshDto) {
    return this.service.refresh(dto.refresh_token)
  }

  @ApiBearerAuth()
  @Get('me')
  me(@Headers('authorization') auth: string) {
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : ''
    return this.service.me(token)
  }
}
