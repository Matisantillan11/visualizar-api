/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { SupabaseService } from '../../../shared/providers/supabase.service';
import { UsersService } from '../../users/user.service';
import { AuthenticatedUser } from '../types/user.interface';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private supabaseService: SupabaseService,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No authorization header found');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      // Verify token with Supabase
      const supabaseUser = await this.supabaseService.getUserFromToken(
        token as string,
      );

      if (!supabaseUser || !supabaseUser.email) {
        throw new UnauthorizedException('Invalid Supabase token');
      }

      // Find the corresponding user in our local database
      const localUser = await this.usersService.getUser({
        supabaseUserId: supabaseUser.id,
      });

      if (!localUser || localUser.deletedAt) {
        throw new UnauthorizedException('User not found in local database');
      }

      // Ensure email matches (additional security check)
      if (localUser.email !== supabaseUser.email) {
        throw new UnauthorizedException(
          'Email mismatch between Supabase and local database',
        );
      }

      const user: AuthenticatedUser = {
        id: localUser.id,
        email: localUser.email,
        name: localUser.name,
        role: localUser.role,
        supabaseUserId: localUser.supabaseUserId!,
      };

      // Additional user validation
      if (!user.id || !user.email || !user.role) {
        throw new UnauthorizedException('Invalid user data');
      }

      // Ensure user has supabaseUserId (required for our security model)
      if (!user.supabaseUserId) {
        throw new UnauthorizedException('User account not properly configured');
      }

      // Attach user to request object for use in controllers
      request.user = user;
      return true;
    } catch (error) {
      const err = error as Error;
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException(`Authentication failed: ${err.message}`);
    }
  }
}
