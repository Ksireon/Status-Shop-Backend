import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AdminSupportController } from './admin-support.controller';
import { AdminSupportService } from './admin-support.service';
import { SupportController } from './support.controller';
import { SupportService } from './support.service';
import { SupportGateway } from './support.gateway';
import { WsJwtGuard } from './guards/ws-jwt.guard';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'default-secret',
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [SupportController, AdminSupportController],
  providers: [SupportService, AdminSupportService, RolesGuard, SupportGateway, WsJwtGuard],
})
export class SupportModule {}
