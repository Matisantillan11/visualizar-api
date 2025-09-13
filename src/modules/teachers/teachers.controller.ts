import {
  Controller,
  Post,
  Body,
  Put,
  Delete,
  Get,
  Param,
} from '@nestjs/common';
import { Prisma, Teacher } from '@prisma/client';
import { TeachersService } from './teachers.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('/api/teachers')
@ApiTags('Teachers')
export class TeachersController {
  constructor(private readonly teacherService: TeachersService) {}

  @Get('/')
  @ApiOperation({ summary: 'Get all teachers' })
  @ApiResponse({ status: 200, description: 'Get all teachers' })
  getTeachers(): Promise<Teacher[]> {
    return this.teacherService.getTeachers();
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Get an teachers by id' })
  @ApiResponse({ status: 200, description: 'Get an teachers by id' })
  getTeacher(@Param('id') id: string): Promise<Teacher | null> {
    return this.teacherService.getTeacher({ id });
  }

  @Post('/')
  @ApiOperation({ summary: 'Create an teachers' })
  @ApiResponse({ status: 201, description: 'Create an teachers' })
  createTeacher(@Body() teacher: Prisma.TeacherCreateInput): Promise<Teacher> {
    return this.teacherService.createTeacher(teacher);
  }

  @Put('/:id')
  @ApiOperation({ summary: 'Update an teachers' })
  @ApiResponse({ status: 200, description: 'Update an teachers' })
  updateTeacher(
    @Param('id') id: string,
    @Body() teacher: Prisma.TeacherUpdateInput,
  ): Promise<Teacher> {
    return this.teacherService.updateTeacher({ where: { id }, data: teacher });
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Delete an teachers' })
  @ApiResponse({ status: 200, description: 'Delete an teachers' })
  deleteTeacher(@Param('id') id: string): Promise<Teacher> {
    return this.teacherService.deleteTeacher({ id });
  }
}
