import { ApiProperty } from '@nestjs/swagger';
import { AnimationType } from '@prisma/client';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

const ANIMATION_TYPE_VALUES = Object.values(AnimationType) as string[];

export class CreateBookRequestDto {
  @ApiProperty({
    description: 'Array of course IDs where the book needs to be published',
    example: ['course-uuid-1', 'course-uuid-2'],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one course ID is required' })
  @IsUUID('4', { each: true, message: 'Each course ID must be a valid UUID' })
  courseIds: string[];

  @ApiProperty({
    description: 'Title of the book',
    example: 'Introduction to Mathematics',
  })
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @ApiProperty({
    description: 'Name of the author',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty({ message: 'Author name is required' })
  authorName: string;

  @ApiProperty({
    description: 'Additional comments about the book request',
    example: 'This book should include interactive exercises',
    required: false,
  })
  @IsString()
  @IsOptional()
  comments?: string;

  @ApiProperty({
    description: 'Types of animations to include in the book',
    example: [AnimationType.ALL],
    enum: AnimationType,
    isArray: true,
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one animation type is required' })
  @IsIn(ANIMATION_TYPE_VALUES, {
    each: true,
    message:
      'Each animation must be a valid AnimationType (ALL, MAIN, or EXTRA)',
  })
  animations: AnimationType[];
}
