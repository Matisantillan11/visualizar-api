import {
  Controller,
  Post,
  Body,
  Put,
  Delete,
  Get,
  Param,
} from '@nestjs/common';
import { Student, Prisma } from '@prisma/client';
import { StudentsService } from './students.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('/api/students')
@ApiTags('Students')
export class StudentsController {
  constructor(private readonly studentService: StudentsService) {}

  @Get('/')
  @ApiOperation({ summary: 'Get all students' })
  @ApiResponse({ status: 200, description: 'Get all students' })
  getStudents(): Promise<Student[]> {
    return this.studentService.getStudents();
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Get an students by id' })
  @ApiResponse({ status: 200, description: 'Get an students by id' })
  getStudent(@Param('id') id: string): Promise<Student | null> {
    return this.studentService.getStudent({ id });
  }

  @Post('/')
  @ApiOperation({ summary: 'Create an students' })
  @ApiResponse({ status: 201, description: 'Create an students' })
  createStudent(@Body() student: Prisma.StudentCreateInput): Promise<Student> {
    return this.studentService.createStudent(student);
  }

  @Put('/:id')
  @ApiOperation({ summary: 'Update an students' })
  @ApiResponse({ status: 200, description: 'Update an students' })
  updateStudent(
    @Param('id') id: string,
    @Body() student: Prisma.StudentUpdateInput,
  ): Promise<Student> {
    return this.studentService.updateStudent({ where: { id }, data: student });
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Delete an students' })
  @ApiResponse({ status: 200, description: 'Delete an students' })
  deleteStudent(@Param('id') id: string): Promise<Student> {
    return this.studentService.deleteStudent({ id });
  }
}
