import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class AuthResponseDto {
  @ApiProperty({
    description: 'Supabase access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token: string;

  @ApiProperty({
    description: 'Supabase refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refresh_token: string;

  @ApiProperty({
    description: 'User information',
  })
  user: {
    id: string;
    teacherId?: string;
    studentId?: string;
    institutionId?: string;
    email: string;
    name: string | null;
    role: Role;
    supabaseUserId: string;
    avatar?: any;
    retryAt?: Date;
    attempts?: number;
  };

  @ApiProperty({
    description: 'Number of OTP attempts remaining',
    example: 3,
  })
  attempts: number;

  @ApiProperty({
    description: 'Date when account will be unblocked (null if not blocked)',
    example: null,
    nullable: true,
  })
  retryAt: Date | null;
}

export class SendOtpResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'OTP sent successfully',
  })
  message: string;

  @ApiProperty({
    description: 'User email where OTP was sent',
    example: 'user@example.com',
  })
  email: string;
}
