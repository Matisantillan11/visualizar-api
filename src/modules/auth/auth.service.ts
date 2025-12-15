import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { SupabaseService } from '../../shared/providers/supabase.service';
import { StudentsService } from '../students/students.service';
import { TeachersService } from '../teachers/teachers.service';
import { UsersService } from '../users/user.service';
import { AuthResponseDto, SendOtpResponseDto } from './dto/auth-response.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { AuthenticatedUser } from './types/user.interface';

interface SupabaseAuthResult {
  session: {
    access_token: string;
    refresh_token: string;
    user: {
      id: string;
      user_metadata?: {
        avatar_url?: string;
      };
    };
  } | null;
  user: {
    id: string;
    email?: string;
  } | null;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private teachersService: TeachersService,
    private studentsService: StudentsService,
    private supabaseService: SupabaseService,
  ) {}

  async sendOtp(sendOtpDto: SendOtpDto): Promise<SendOtpResponseDto> {
    const { email } = sendOtpDto;
    const emailToLowerCase = email.toLowerCase();

    // First, validate that the user exists in our local database
    const user = await this.usersService.getUser({ email: emailToLowerCase });

    if (!user || user.deletedAt) {
      throw new UnauthorizedException(
        'User not found. Please contact an administrator to create your account.',
      );
    }

    // Check if account is blocked
    const now = new Date();
    if (user.retryAt && user.retryAt > now) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const userAttempts: number = user.attempts || 0;
      const remainingAttempts: number = Math.max(0, 3 - userAttempts);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const retryAtDate: Date = user.retryAt;
      const errorResponse: {
        message: string;
        attempts: number;
        retryAt: Date;
      } = {
        message:
          'Account is temporarily blocked due to multiple failed OTP attempts',
        attempts: remainingAttempts,
        retryAt: retryAtDate,
      };
      throw new UnauthorizedException(errorResponse);
    }

    // Reset attempts if block period has expired
    if (user.retryAt && user.retryAt <= now) {
      await this.usersService.updateUser({
        where: { id: user.id },
        data: {
          attempts: 0,
          retryAt: null,
        },
      });
    }

    try {
      // Send OTP via Supabase
      await this.supabaseService.sendOTP(emailToLowerCase);

      return {
        message: 'OTP sent successfully',
        email: emailToLowerCase,
      };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      throw new BadRequestException(`Failed to send OTP: ${err.message}`);
    }
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<AuthResponseDto> {
    const { email, token } = verifyOtpDto;

    const emailToLowerCase = email.toLowerCase();
    // Validate that the user exists in our local database
    const user = await this.usersService.getUser({ email: emailToLowerCase });
    if (!user || user.deletedAt) {
      throw new UnauthorizedException('User not found');
    }

    // Check if account is blocked
    const now = new Date();
    if (user.retryAt && user.retryAt > now) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const userAttempts: number = user.attempts || 0;
      const remainingAttempts: number = Math.max(0, 3 - userAttempts);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const retryAtDate: Date = user.retryAt;
      const errorResponse: {
        message: string;
        attempts: number;
        retryAt: Date;
      } = {
        message:
          'Account is temporarily blocked due to multiple failed OTP attempts',
        attempts: remainingAttempts,
        retryAt: retryAtDate,
      };
      throw new UnauthorizedException(errorResponse);
    }

    // Reset attempts if block period has expired
    if (user.retryAt && user.retryAt <= now) {
      await this.usersService.updateUser({
        where: { id: user.id },
        data: {
          attempts: 0,
          retryAt: null,
        },
      });
    }

    let supabaseAuthResult: SupabaseAuthResult;
    try {
      // Verify OTP with Supabase
      supabaseAuthResult = (await this.supabaseService.verifyOTP(
        emailToLowerCase,
        token,
      )) as SupabaseAuthResult;
    } catch (error: unknown) {
      // Handle Supabase OTP verification errors
      const err = error instanceof Error ? error : new Error(String(error));
      console.log({ err });

      // Increment failed attempts for Supabase errors
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const newAttempts: number = (user.attempts || 0) + 1;
      const shouldBlock = newAttempts >= 3;
      const blockedUntil: Date | null = shouldBlock
        ? new Date(now.getTime() + 5 * 60 * 1000) // 5 minutes from now
        : null;

      await this.usersService.updateUser({
        where: { id: user.id },
        data: {
          attempts: newAttempts,
          retryAt: blockedUntil,
        },
      });

      const remainingAttempts: number = Math.max(0, 3 - newAttempts);
      const errorResponse = {
        message: 'Invalid or expired OTP code',
        attempts: remainingAttempts,
        retryAt: blockedUntil,
      };
      throw new UnauthorizedException(errorResponse);
    }

    // Check if session is valid after successful Supabase verification
    if (!supabaseAuthResult?.session || !supabaseAuthResult?.user) {
      // Increment failed attempts
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const newAttempts: number = (user.attempts || 0) + 1;
      const shouldBlock = newAttempts >= 3;
      const blockedUntil: Date | null = shouldBlock
        ? new Date(now.getTime() + 5 * 60 * 1000) // 5 minutes from now
        : null;

      await this.usersService.updateUser({
        where: { id: user.id },
        data: {
          attempts: newAttempts,
          retryAt: blockedUntil,
        },
      });

      const remainingAttempts: number = Math.max(0, 3 - newAttempts);
      const errorResponse: {
        message: string;
        attempts: number;
        retryAt: Date | null;
      } = {
        message: 'Invalid OTP or expired token',
        attempts: remainingAttempts,
        retryAt: blockedUntil,
      };
      throw new UnauthorizedException(errorResponse);
    }

    // At this point, we know session and user are not null (checked above)
    const session = supabaseAuthResult.session;
    const supabaseUser = supabaseAuthResult.user;

    if (!session || !supabaseUser) {
      throw new UnauthorizedException('Invalid session data');
    }

    // Reset OTP attempts on successful verification
    await this.usersService.updateUser({
      where: { id: user.id },
      data: {
        attempts: 0,
        retryAt: null,
        supabaseUserId: supabaseUser.id,
      },
    });

    const isTeacher = user.role === Role.TEACHER;
    const isStudent = user.role === Role.STUDENT;

    if (isTeacher) {
      const teacher = await this.teachersService.getTeacher({
        userId: user.id,
      });

      if (!teacher) {
        throw new UnauthorizedException('Teacher not found');
      }

      return {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        user: {
          id: user.id,
          teacherId: teacher.id,
          email: user.email,
          name: user.name,
          role: user.role,
          supabaseUserId: supabaseUser.id,
        },
        attempts: 3,
        retryAt: null,
      };
    }

    if (isStudent) {
      const student = await this.studentsService.getStudent({
        userId: user.id,
      });

      if (!student) {
        throw new UnauthorizedException('Student not found');
      }

      return {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        user: {
          id: user.id,
          studentId: student.id,
          email: user.email,
          name: user.name,
          role: user.role,
          supabaseUserId: supabaseUser.id,
          avatar: session.user.user_metadata?.avatar_url,
        },
        attempts: 3,
        retryAt: null,
      };
    }

    return {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        supabaseUserId: supabaseUser.id,
      },
      attempts: 3,
      retryAt: null,
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

  async validateSupabaseToken(accessToken: string): Promise<AuthenticatedUser> {
    try {
      // Verify token with Supabase
      const supabaseUser =
        await this.supabaseService.getUserFromToken(accessToken);

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

      return {
        id: localUser.id,
        email: localUser.email,
        name: localUser.name,
        role: localUser.role,
        supabaseUserId: localUser.supabaseUserId!,
      };
    } catch (error) {
      const err = error as Error;
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      throw new UnauthorizedException(
        `Token validation failed: ${err.message}`,
      );
    }
  }

  async createUser(createUserDto: {
    email: string;
    dni: string;
    role: Role;
    name?: string;
  }): Promise<{
    id: string;
    email: string;
    name: string | null;
    dni: string;
    role: Role;
    supabaseUserId: string;
  }> {
    const { email, dni, role, name } = createUserDto;
    const emailToLowerCase = email.toLowerCase();

    // Check if user already exists in database
    const existingUser = await this.usersService.getUser({
      email: emailToLowerCase,
    });

    if (existingUser && !existingUser.deletedAt) {
      throw new BadRequestException(
        'User with this email already exists in the database',
      );
    }

    // Check if DNI already exists
    const existingDniUser = await this.usersService.getUser({ dni });
    if (existingDniUser && !existingDniUser.deletedAt) {
      throw new BadRequestException(
        'User with this DNI already exists in the database',
      );
    }

    let supabaseUserId: string;

    try {
      // Step 1: Create user in Supabase
      const supabaseResult =
        await this.supabaseService.createUser(emailToLowerCase);

      if (!supabaseResult.user) {
        throw new Error('Supabase user creation failed');
      }

      supabaseUserId = supabaseResult.user.id;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      // If Supabase creation fails, we do not proceed to database creation
      throw new BadRequestException(
        `Failed to create Supabase user: ${err.message}`,
      );
    }

    try {
      // Step 2: Create user in database (only if Supabase creation succeeded)
      const dbUser = await this.usersService.createUser({
        email: emailToLowerCase,
        dni,
        role,
        name: name || null,
        supabaseUserId,
      });

      // Step 3: Create role-specific records (Student or Teacher)
      if (role === Role.STUDENT) {
        await this.studentsService.createStudent({
          user: {
            connect: { id: dbUser.id },
          },
        });
      } else if (role === Role.TEACHER) {
        await this.teachersService.createTeacher({
          user: {
            connect: { id: dbUser.id },
          },
        });
      }

      return {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        dni: dbUser.dni,
        role: dbUser.role,
        supabaseUserId: dbUser.supabaseUserId!,
      };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      // If database creation fails after Supabase creation, we should ideally clean up the Supabase user
      // For now, we'll just throw an error
      throw new BadRequestException(
        `Failed to create database user: ${err.message}`,
      );
    }
  }
}
