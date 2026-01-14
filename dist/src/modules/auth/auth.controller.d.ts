import type { Request } from 'express';
import { AuthService } from './auth.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private readonly auth;
    constructor(auth: AuthService);
    register(req: Request, dto: RegisterDto): Promise<AuthResponseDto>;
    login(req: Request, dto: LoginDto): Promise<AuthResponseDto>;
    refresh(req: Request, dto: RefreshDto): Promise<AuthResponseDto>;
    logout(dto: RefreshDto): Promise<{
        ok: true;
    }>;
}
