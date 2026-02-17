import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import type { JwtPayload } from '../../common/types/jwt-payload';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

type AuthUserRow = {
  id: string;
  email: string;
  passwordHash: string;
  role: JwtPayload['role'];
  isActive: boolean;
  shopId: string | null;
  name: string | null;
  phone: string | null;
  city: string | null;
  company: string | null;
  position: string | null;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already registered');

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
    const user = created as unknown as AuthUserRow;

    const accessToken = await this.signAccessToken(
      user.id,
      user.email,
      user.role,
      user.shopId,
    );

    return {
      accessToken,
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

  async login(dto: LoginDto) {
    const found = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    const user = found as unknown as AuthUserRow | null;
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (!user.isActive) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const accessToken = await this.signAccessToken(
      user.id,
      user.email,
      user.role,
      user.shopId,
    );

    return {
      accessToken,
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

  async signAccessToken(
    userId: string,
    email: string,
    role: JwtPayload['role'],
    shopId?: string | null,
  ) {
    const payload: JwtPayload = { sub: userId, email, role, shopId };
    return this.jwt.signAsync(payload);
  }
}
