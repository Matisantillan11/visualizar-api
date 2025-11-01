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
import { Prisma, Role, type Teacher, type TeacherCourse } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TeachersService } from './teachers.service';

@Controller('/api/teachers')
@ApiTags('Teachers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class TeachersController {
  constructor(private readonly teacherService: TeachersService) {}

  @Get('/')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all teachers' })
  @ApiResponse({ status: 200, description: 'Get all teachers' })
  getTeachers(): Promise<Teacher[]> {
    return this.teacherService.getTeachers();
  }

  @Get('/:id')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Get an teachers by id' })
  @ApiResponse({ status: 200, description: 'Get an teachers by id' })
  getTeacher(@Param('id') id: string): Promise<Teacher | null> {
    return this.teacherService.getTeacher({ id });
  }

  @Post('/')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create an teachers' })
  @ApiResponse({ status: 201, description: 'Create an teachers' })
  createTeacher(@Body() teacher: Prisma.TeacherCreateInput): Promise<Teacher> {
    return this.teacherService.createTeacher(teacher);
  }

  @Put('/:id')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Update an teachers' })
  @ApiResponse({ status: 200, description: 'Update an teachers' })
  updateTeacher(
    @Param('id') id: string,
    @Body() teacher: Prisma.TeacherUpdateInput,
  ): Promise<Teacher> {
    return this.teacherService.updateTeacher({ where: { id }, data: teacher });
  }

  @Delete('/:id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete an teachers' })
  @ApiResponse({ status: 200, description: 'Delete an teachers' })
  deleteTeacher(@Param('id') id: string): Promise<Teacher> {
    return this.teacherService.deleteTeacher({ id });
  }

  @Post('/assign-course')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Assign a course to a teacher' })
  @ApiResponse({ status: 201, description: 'Assign a course to a teacher' })
  assignCourseToTeacher(
    @Body() data: { teacherId: string; courseIds: Array<string> },
  ): Promise<Array<TeacherCourse>> {
    return this.teacherService.assignCourseToTeacher({
      data,
    });
  }
}
