"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const crypto = __importStar(require("crypto"));
const prisma_service_1 = require("../prisma/prisma.service");
let AuthService = class AuthService {
    prisma;
    jwt;
    config;
    constructor(prisma, jwt, config) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.config = config;
    }
    async register(dto, meta) {
        const exists = await this.prisma.user.findUnique({
            where: { email: dto.email },
            select: { id: true },
        });
        if (exists)
            throw new common_1.ConflictException('Email already exists');
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
                role: client_1.UserRole.CUSTOMER,
            },
            select: { id: true, email: true, role: true },
        });
        return this.issueTokens(user, meta);
    }
    async login(dto, meta) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
            select: {
                id: true,
                email: true,
                role: true,
                passwordHash: true,
                isActive: true,
            },
        });
        if (!user || !user.isActive)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const ok = await bcrypt.compare(dto.password, user.passwordHash);
        if (!ok)
            throw new common_1.UnauthorizedException('Invalid credentials');
        return this.issueTokens({ id: user.id, email: user.email, role: user.role }, meta);
    }
    async refresh(refreshToken, meta) {
        const tokenHash = this.hashRefreshToken(refreshToken);
        const session = await this.prisma.session.findUnique({
            where: { refreshTokenHash: tokenHash },
            include: {
                user: { select: { id: true, email: true, role: true, isActive: true } },
            },
        });
        if (!session)
            throw new common_1.UnauthorizedException('Invalid refresh token');
        if (session.revokedAt) {
            await this.prisma.session.updateMany({
                where: { userId: session.userId, revokedAt: null },
                data: { revokedAt: new Date() },
            });
            throw new common_1.UnauthorizedException('Refresh token reuse detected');
        }
        if (session.expiresAt.getTime() <= Date.now())
            throw new common_1.UnauthorizedException('Refresh token expired');
        if (!session.user.isActive)
            throw new common_1.UnauthorizedException('User is inactive');
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
    async logout(refreshToken) {
        const tokenHash = this.hashRefreshToken(refreshToken);
        const session = await this.prisma.session.findUnique({
            where: { refreshTokenHash: tokenHash },
        });
        if (!session)
            return;
        if (session.revokedAt)
            return;
        await this.prisma.session.update({
            where: { id: session.id },
            data: { revokedAt: new Date() },
        });
    }
    async issueTokens(user, meta) {
        const [accessToken, refresh] = await Promise.all([
            this.signAccessToken(user),
            this.createSession(user.id, meta),
        ]);
        return { accessToken, refreshToken: refresh.refreshToken };
    }
    async signAccessToken(user) {
        const payload = {
            email: user.email,
            role: user.role,
        };
        const expiresIn = (this.config.get('JWT_ACCESS_EXPIRES_IN') ||
            this.config.get('JWT_EXPIRES_IN') ||
            '15m');
        return this.jwt.signAsync(payload, {
            secret: this.config.getOrThrow('JWT_SECRET'),
            expiresIn,
            subject: user.id,
        });
    }
    hashRefreshToken(token) {
        const secret = this.config.get('REFRESH_TOKEN_SECRET') ||
            this.config.getOrThrow('JWT_SECRET');
        return crypto
            .createHash('sha256')
            .update(`${token}.${secret}`)
            .digest('hex');
    }
    refreshExpiresAt() {
        const raw = this.config.get('JWT_REFRESH_EXPIRES_IN') || '30d';
        return new Date(Date.now() + this.durationToMs(raw));
    }
    durationToMs(value) {
        const v = value.trim();
        const match = /^(\d+)\s*([smhd])$/i.exec(v);
        if (!match)
            return 30 * 24 * 60 * 60 * 1000;
        const amount = Number(match[1]);
        const unit = match[2].toLowerCase();
        if (unit === 's')
            return amount * 1000;
        if (unit === 'm')
            return amount * 60 * 1000;
        if (unit === 'h')
            return amount * 60 * 60 * 1000;
        return amount * 24 * 60 * 60 * 1000;
    }
    async createSession(userId, meta) {
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map