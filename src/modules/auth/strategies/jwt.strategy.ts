import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/user.service';
import { JwtPayload } from '../types/jwt-payload.interface';
import { AuthenticatedUser } from '../types/user.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'your-secret-key',
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    // Validate payload structure
    if (!payload.sub || !payload.email || !payload.role) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const user = await this.usersService.getUser({ id: payload.sub });

    if (!user || user.deletedAt) {
      throw new UnauthorizedException('User not found');
    }

    // Additional security checks
    if (user.email !== payload.email) {
      throw new UnauthorizedException('Token email mismatch');
    }

    if (user.role !== payload.role) {
      throw new UnauthorizedException('Token role mismatch');
    }

    // Ensure user has supabaseUserId (required for our security model)
    if (!user.supabaseUserId) {
      throw new UnauthorizedException('User account not properly configured');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      supabaseUserId: user.supabaseUserId,
    };
  }
}
