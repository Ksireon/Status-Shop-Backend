import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import type { SignOptions } from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

type SessionMeta = {
  ip?: string;
  userAgent?: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto, meta?: SessionMeta) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true },
    });
    if (exists) throw new ConflictException('Email already exists');

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        name: dto.name,
        surname: dto.surname,
        company: dto.company,
        position: dto.position,
        city: dto.city,
        phone: dto.phone,
        role: UserRole.CUSTOMER,
      },
      select: { id: true, email: true, role: true },
    });

    return this.issueTokens(user, meta);
  }

  async login(dto: LoginDto, meta?: SessionMeta) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true, email: true, role: true, passwordHash: true, isActive: true },
    });

    if (!user || !user.isActive) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    return this.issueTokens({ id: user.id, email: user.email, role: user.role }, meta);
  }

  async refresh(refreshToken: string, meta?: SessionMeta) {
    const tokenHash = this.hashRefreshToken(refreshToken);

    const session = await this.prisma.session.findUnique({
      where: { refreshTokenHash: tokenHash },
      include: { user: { select: { id: true, email: true, role: true, isActive: true } } },
    });

    if (!session) throw new UnauthorizedException('Invalid refresh token');
    if (session.revokedAt) {
      await this.prisma.session.updateMany({
        where: { userId: session.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException('Refresh token reuse detected');
    }
    if (session.expiresAt.getTime() <= Date.now()) throw new UnauthorizedException('Refresh token expired');
    if (!session.user.isActive) throw new UnauthorizedException('User is inactive');

    const next = await this.createSession(session.userId, meta);

    await this.prisma.session.update({
      where: { id: session.id },
      data: { revokedAt: new Date(), replacedBySessionId: next.sessionId },
    });

    const accessToken = await this.signAccessToken({
      id: session.user.id,
      email: session.user.email,
      role: session.user.role,
    });

    return { accessToken, refreshToken: next.refreshToken };
  }

  async logout(refreshToken: string) {
    const tokenHash = this.hashRefreshToken(refreshToken);
    const session = await this.prisma.session.findUnique({ where: { refreshTokenHash: tokenHash } });
    if (!session) return;
    if (session.revokedAt) return;
    await this.prisma.session.update({ where: { id: session.id }, data: { revokedAt: new Date() } });
  }

  private async issueTokens(user: { id: string; email: string; role: UserRole }, meta?: SessionMeta) {
    const [accessToken, refresh] = await Promise.all([
      this.signAccessToken(user),
      this.createSession(user.id, meta),
    ]);
    return { accessToken, refreshToken: refresh.refreshToken };
  }

  private async signAccessToken(user: { id: string; email: string; role: UserRole }) {
    const payload = {
      email: user.email,
      role: user.role,
    };

    const expiresIn = (this.config.get<string>('JWT_ACCESS_EXPIRES_IN') ||
      this.config.get<string>('JWT_EXPIRES_IN') ||
      '15m') as SignOptions['expiresIn'];

    return this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow<string>('JWT_SECRET'),
      expiresIn,
      subject: user.id,
    });
  }

  private hashRefreshToken(token: string) {
    const secret = this.config.get<string>('REFRESH_TOKEN_SECRET') || this.config.getOrThrow<string>('JWT_SECRET');
    return crypto.createHash('sha256').update(`${token}.${secret}`).digest('hex');
  }

  private refreshExpiresAt() {
    const raw = this.config.get<string>('JWT_REFRESH_EXPIRES_IN') || '30d';
    return new Date(Date.now() + this.durationToMs(raw));
  }

  private durationToMs(value: string) {
    const v = value.trim();
    const match = /^(\d+)\s*([smhd])$/i.exec(v);
    if (!match) return 30 * 24 * 60 * 60 * 1000;
    const amount = Number(match[1]);
    const unit = match[2].toLowerCase();
    if (unit === 's') return amount * 1000;
    if (unit === 'm') return amount * 60 * 1000;
    if (unit === 'h') return amount * 60 * 60 * 1000;
    return amount * 24 * 60 * 60 * 1000;
  }

  private async createSession(userId: string, meta?: SessionMeta) {
    const refreshToken = crypto.randomBytes(48).toString('base64url');
    const refreshTokenHash = this.hashRefreshToken(refreshToken);
    const expiresAt = this.refreshExpiresAt();
    const session = await this.prisma.session.create({
      data: {
        user: { connect: { id: userId } },
        refreshTokenHash,
        expiresAt,
        ip: meta?.ip,
        userAgent: meta?.userAgent,
      },
      select: { id: true },
    });
    return { sessionId: session.id, refreshToken };
  }
}
