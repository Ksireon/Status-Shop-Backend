import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { createHash, randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import type { JwtPayload } from '../../common/types/jwt-payload';
import { parseDurationSeconds } from '../../common/utils/parse-duration-seconds';
import { buildAppError } from '../../common/errors/app-error';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException(
        buildAppError(
          'AUTH_EMAIL_ALREADY_REGISTERED',
          'Email already registered',
        ),
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const created = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        name: dto.name,
        phone: dto.phone,
        city: dto.city,
        company: dto.company,
        position: dto.position,
      },
    });

    return this.buildAuthResponse(created);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user || !user.isActive) {
      throw new UnauthorizedException(
        buildAppError('AUTH_INVALID_CREDENTIALS', 'Invalid credentials'),
      );
    }

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException(
        buildAppError('AUTH_INVALID_CREDENTIALS', 'Invalid credentials'),
      );
    }

    return this.buildAuthResponse(user);
  }

  async refresh(refreshToken: string) {
    const refreshSecret = this.config.getOrThrow<string>('JWT_REFRESH_SECRET');
    let payload: { sub: string; jti?: string };
    try {
      payload = await this.jwt.verifyAsync(refreshToken, {
        secret: refreshSecret,
      });
    } catch {
      throw new UnauthorizedException(
        buildAppError('AUTH_REFRESH_INVALID', 'Invalid refresh token'),
      );
    }

    const tokenHash = this.hashToken(refreshToken);
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
    });
    if (
      !stored ||
      stored.userId !== payload.sub ||
      stored.expiresAt <= new Date()
    ) {
      throw new UnauthorizedException(
        buildAppError('AUTH_REFRESH_INVALID', 'Invalid refresh token'),
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user || !user.isActive) {
      throw new UnauthorizedException(
        buildAppError('AUTH_REFRESH_INVALID', 'Invalid refresh token'),
      );
    }

    await this.prisma.refreshToken.deleteMany({ where: { tokenHash } });
    return this.buildAuthResponse(user);
  }

  async logout(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);
    await this.prisma.refreshToken.deleteMany({ where: { tokenHash } });
    return { ok: true };
  }

  async signAccessToken(
    userId: string,
    email: string,
    role: JwtPayload['role'],
    shopId?: string | null,
  ) {
    const payload: JwtPayload = { sub: userId, email, role, shopId };
    return this.jwt.signAsync(payload);
  }

  private async signRefreshToken(userId: string) {
    const refreshSecret = this.config.getOrThrow<string>('JWT_REFRESH_SECRET');
    const refreshTtl = parseDurationSeconds(
      this.config.get<string>('JWT_REFRESH_TTL'),
    );
    const payload = { sub: userId, jti: randomUUID() };
    const refreshToken = await this.jwt.signAsync(payload, {
      secret: refreshSecret,
      expiresIn: refreshTtl,
    });
    const tokenHash = this.hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + refreshTtl * 1000);
    await this.refreshTokens.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });
    return refreshToken;
  }

  private async buildAuthResponse(user: User) {
    const accessToken = await this.signAccessToken(
      user.id,
      user.email,
      user.role,
      user.shopId,
    );
    const refreshToken = await this.signRefreshToken(user.id);
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        shopId: user.shopId,
        name: user.name,
        phone: user.phone,
        city: user.city,
        company: user.company,
        position: user.position,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }
}
