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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMe(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                surname: true,
                company: true,
                position: true,
                city: true,
                phone: true,
                role: true,
            },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async updateMe(userId, dto) {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: {
                name: dto.name,
                surname: dto.surname,
                company: dto.company,
                position: dto.position,
                city: dto.city,
                phone: dto.phone,
            },
            select: {
                id: true,
                email: true,
                name: true,
                surname: true,
                company: true,
                position: true,
                city: true,
                phone: true,
                role: true,
            },
        });
        return user;
    }
    async adminList(filter) {
        const where = {
            ...(filter.role ? { role: filter.role } : {}),
            ...(filter.isActive !== undefined ? { isActive: filter.isActive } : {}),
            ...(filter.q
                ? {
                    OR: [
                        { email: { contains: filter.q, mode: 'insensitive' } },
                        { name: { contains: filter.q, mode: 'insensitive' } },
                        { surname: { contains: filter.q, mode: 'insensitive' } },
                        { phone: { contains: filter.q, mode: 'insensitive' } },
                    ],
                }
                : {}),
        };
        const users = await this.prisma.user.findMany({
            where,
            orderBy: [{ createdAt: 'desc' }],
            skip: filter.skip ?? 0,
            take: filter.take ?? 50,
            select: {
                id: true,
                email: true,
                name: true,
                surname: true,
                company: true,
                position: true,
                city: true,
                phone: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return users.map((u) => ({
            ...u,
            createdAt: u.createdAt.toISOString(),
            updatedAt: u.updatedAt.toISOString(),
        }));
    }
    async adminGet(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                surname: true,
                company: true,
                position: true,
                city: true,
                phone: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return {
            ...user,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
        };
    }
    async adminUpdate(current, id, dto) {
        const exists = await this.prisma.user.findUnique({
            where: { id },
            select: { id: true },
        });
        if (!exists)
            throw new common_1.NotFoundException('User not found');
        if (dto.role !== undefined && current.role !== client_1.UserRole.ADMIN) {
            throw new common_1.BadRequestException('Only ADMIN can change role');
        }
        await this.prisma.user.update({
            where: { id },
            data: {
                name: dto.name,
                surname: dto.surname,
                company: dto.company,
                position: dto.position,
                city: dto.city,
                phone: dto.phone,
                isActive: dto.isActive,
                role: dto.role,
            },
        });
        return this.adminGet(id);
    }
    async adminCreate(current, dto) {
        if (current.role !== client_1.UserRole.ADMIN)
            throw new common_1.BadRequestException('Only ADMIN can create users');
        const exists = await this.prisma.user.findUnique({
            where: { email: dto.email },
            select: { id: true },
        });
        if (exists)
            throw new common_1.BadRequestException('Email already exists');
        const passwordHash = await bcrypt.hash(dto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                passwordHash,
                role: dto.role,
                name: dto.name,
                surname: dto.surname,
                company: dto.company,
                position: dto.position,
                city: dto.city,
                phone: dto.phone,
                isActive: dto.isActive ?? true,
            },
            select: { id: true },
        });
        return this.adminGet(user.id);
    }
    async adminDeactivate(id) {
        const exists = await this.prisma.user.findUnique({
            where: { id },
            select: { id: true },
        });
        if (!exists)
            throw new common_1.NotFoundException('User not found');
        await this.prisma.user.update({ where: { id }, data: { isActive: false } });
        return { ok: true };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map