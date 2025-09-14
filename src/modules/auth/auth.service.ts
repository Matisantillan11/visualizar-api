import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/user.service';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { JwtPayload } from './types/jwt-payload.interface';
import { AuthenticatedUser } from './types/user.interface';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, supabaseUserId } = loginDto;

    // For security, we require both email and supabaseUserId to match
    // This prevents authentication with just email knowledge
    const user = await this.usersService.getUser({ email });

    if (!user || user.deletedAt) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Validate that the supabaseUserId matches the user's record
    if (!user.supabaseUserId) {
      throw new UnauthorizedException('User account not properly configured');
    }

    if (user.supabaseUserId !== supabaseUserId) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async validateUserById(userId: string): Promise<AuthenticatedUser> {
    const user = await this.usersService.getUser({ id: userId });

    if (!user || user.deletedAt) {
      throw new UnauthorizedException('User not found');
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

  async validateToken(token: string): Promise<AuthenticatedUser> {
    try {
      const decoded: JwtPayload = this.jwtService.verify(token);
      return await this.validateUserById(decoded.sub);
    } catch (error) {
      const err = error as Error;
      if (err.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token has expired');
      }
      if (err.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token');
      }
      throw new UnauthorizedException('Token validation failed');
    }
  }
}
