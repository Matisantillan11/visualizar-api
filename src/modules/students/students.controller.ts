import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Prisma, Role, type Student, type StudentCourse } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { StudentsService } from './students.service';

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

  @Post('/assign-course')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Assign courses to a student' })
  @ApiResponse({ status: 201, description: 'Assign courses to a student' })
  assignCourseToStudent(
    @Body() data: { studentId: string; courseIds: Array<string> },
  ): Promise<Array<StudentCourse>> {
    return this.studentService.assignCourseToStudent({ data });
  }

  @Get('/:id/courses')
  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT)
  @ApiOperation({ summary: 'Get courses assigned to a student' })
  @ApiResponse({
    status: 200,
    description: 'Get courses assigned to a student',
  })
  getCoursesOfStudent(@Param('id') id: string): Promise<Array<any>> {
    return this.studentService.getCoursesOfStudent(id);
  }

  @Delete('/:studentId/courses/:courseId')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Remove a student from a course' })
  @ApiResponse({ status: 200, description: 'Remove a student from a course' })
  removeStudentFromCourse(
    @Param('studentId') studentId: string,
    @Param('courseId') courseId: string,
  ): Promise<StudentCourse> {
    return this.studentService.removeStudentFromCourse({
      data: { studentId, courseId },
    });
  }
}
