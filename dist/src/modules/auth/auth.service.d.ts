import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
type SessionMeta = {
    ip?: string;
    userAgent?: string;
};
export declare class AuthService {
    private readonly prisma;
    private readonly jwt;
    private readonly config;
    constructor(prisma: PrismaService, jwt: JwtService, config: ConfigService);
    register(dto: RegisterDto, meta?: SessionMeta): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    login(dto: LoginDto, meta?: SessionMeta): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    refresh(refreshToken: string, meta?: SessionMeta): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(refreshToken: string): Promise<void>;
    private issueTokens;
    private signAccessToken;
    private hashRefreshToken;
    private refreshExpiresAt;
    private durationToMs;
    private createSession;
}
export {};
