import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient();
      const token = this.extractToken(client);
      
      if (!token) {
        throw new UnauthorizedException('No token provided');
      }

      const payload = await this.jwtService.verifyAsync(token);
      client.data.user = payload;
      
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractToken(client: Socket): string | null {
    // Try to get token from auth header in handshake
    const authHeader = client.handshake.auth.token || 
                       client.handshake.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    
    // Try to get token from query params
    const tokenFromQuery = client.handshake.query.token as string;
    if (tokenFromQuery) {
      return tokenFromQuery;
    }
    
    return null;
  }
}
