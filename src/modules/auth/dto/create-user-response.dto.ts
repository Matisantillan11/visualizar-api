import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class CreateUserResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'User created successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Created user information',
  })
  user: {
    id: string;
    email: string;
    name: string | null;
    dni: string;
    role: Role;
    supabaseUserId: string;
  };
}
