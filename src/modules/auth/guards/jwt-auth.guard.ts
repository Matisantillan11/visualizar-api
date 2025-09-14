import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { AuthenticatedUser, JwtError } from '../types/user.interface';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }

  handleRequest<TUser extends AuthenticatedUser>(
    err: JwtError,
    user: TUser,
  ): TUser {
    // Enhanced error handling
    if (err || !user) {
      if (user?.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token has expired');
      }
      if (user?.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token format');
      }
      if (user?.name === 'NotBeforeError') {
        throw new UnauthorizedException('Token not active yet');
      }
      if (err) {
        throw new UnauthorizedException(err.message);
      }
      throw new UnauthorizedException('Authentication required');
    }

    // Additional user validation
    if (!user.id || !user.email || !user.role) {
      throw new UnauthorizedException('Invalid user data');
    }

    // Ensure user has supabaseUserId (required for our security model)
    if (!user.supabaseUserId) {
      throw new UnauthorizedException('User account not properly configured');
    }

    return user;
  }
}
