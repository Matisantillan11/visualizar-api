import {
  Controller,
  Post,
  Body,
  Put,
  Delete,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { Student, Prisma, Role } from '@prisma/client';
import { StudentsService } from './students.service';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('/api/students')
@ApiTags('Students')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentsController {
  constructor(private readonly studentService: StudentsService) {}

  @Get('/')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Get all students' })
  @ApiResponse({ status: 200, description: 'Get all students' })
  getStudents(): Promise<Student[]> {
    return this.studentService.getStudents();
  }

  @Get('/:id')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Get an students by id' })
  @ApiResponse({ status: 200, description: 'Get an students by id' })
  getStudent(@Param('id') id: string): Promise<Student | null> {
    return this.studentService.getStudent({ id });
  }

  @Post('/')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create an students' })
  @ApiResponse({ status: 201, description: 'Create an students' })
  createStudent(@Body() student: Prisma.StudentCreateInput): Promise<Student> {
    return this.studentService.createStudent(student);
  }

  @Put('/:id')
  @Roles(Role.ADMIN, Role.STUDENT)
  @ApiOperation({ summary: 'Update an students' })
  @ApiResponse({ status: 200, description: 'Update an students' })
  updateStudent(
    @Param('id') id: string,
    @Body() student: Prisma.StudentUpdateInput,
  ): Promise<Student> {
    return this.studentService.updateStudent({ where: { id }, data: student });
  }

  @Delete('/:id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete an students' })
  @ApiResponse({ status: 200, description: 'Delete an students' })
  deleteStudent(@Param('id') id: string): Promise<Student> {
    return this.studentService.deleteStudent({ id });
  }
}
