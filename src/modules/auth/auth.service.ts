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

    try {
      // Send OTP via Supabase
      await this.supabaseService.sendOTP(emailToLowerCase);

      return {
        message: 'OTP sent successfully',
        email: emailToLowerCase,
      };
    } catch (error) {
      const err = error as Error;
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

    try {
      // Verify OTP with Supabase
      const supabaseAuthResult = await this.supabaseService.verifyOTP(
        emailToLowerCase,
        token,
      );

      console.log({
        supabaseAuthResult: supabaseAuthResult.user?.app_metadata,
      });

      if (!supabaseAuthResult.session || !supabaseAuthResult.user) {
        throw new UnauthorizedException('Invalid OTP or expired token');
      }

      // Update user's supabaseUserId if it's not set or has changed
      if (
        !user.supabaseUserId ||
        user.supabaseUserId !== supabaseAuthResult.user.id
      ) {
        await this.usersService.updateUser({
          where: { id: user.id },
          data: { supabaseUserId: supabaseAuthResult.user.id },
        });
      }

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
          access_token: supabaseAuthResult.session.access_token,
          refresh_token: supabaseAuthResult.session.refresh_token,
          user: {
            id: user.id,
            teacherId: teacher.id,
            email: user.email,
            name: user.name,
            role: user.role,
            supabaseUserId: supabaseAuthResult.user.id,
          },
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
          access_token: supabaseAuthResult.session.access_token,
          refresh_token: supabaseAuthResult.session.refresh_token,
          user: {
            id: user.id,
            studentId: student.id,
            email: user.email,
            name: user.name,
            role: user.role,
            supabaseUserId: supabaseAuthResult.user.id,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            avatar: supabaseAuthResult?.session?.user.user_metadata.avatar_url,
          },
        };
      }

      return {
        access_token: supabaseAuthResult.session.access_token,
        refresh_token: supabaseAuthResult.session.refresh_token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          supabaseUserId: supabaseAuthResult.user.id,
        },
      };
    } catch (error) {
      const err = error as Error;
      console.log({ err });
      if (
        err.message.includes('Invalid OTP') ||
        err.message.includes('expired')
      ) {
        throw new UnauthorizedException('Invalid or expired OTP code');
      }
      throw new BadRequestException(`Failed to verify OTP: ${err.message}`);
    }
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
    } catch (error) {
      const err = error as Error;
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
    } catch (error) {
      const err = error as Error;
      // If database creation fails after Supabase creation, we should ideally clean up the Supabase user
      // For now, we'll just throw an error
      throw new BadRequestException(
        `Failed to create database user: ${err.message}`,
      );
    }
  }
}
