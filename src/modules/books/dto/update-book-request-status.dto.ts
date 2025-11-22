import { ApiProperty } from '@nestjs/swagger';
import { BookRequestStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateBookRequestStatusDto {
  @ApiProperty({
    description: 'New status for the book request',
    enum: BookRequestStatus,
    example: BookRequestStatus.APPROVED,
  })
  @IsEnum(BookRequestStatus, {
    message: 'Status must be one of: PENDING, APPROVED, DENIED, or PUBLISHED',
  })
  @IsNotEmpty({ message: 'Status is required' })
  status: BookRequestStatus;
}
