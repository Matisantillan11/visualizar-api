import { Role } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

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
    email: string;
    name: string | null;
    role: Role;
    supabaseUserId: string;
  };
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
