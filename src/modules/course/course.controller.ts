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
import { type Course, Prisma, Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CourseService } from './course.service';

@Controller('/api/courses')
@ApiTags('Courses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get('/')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Get all courses' })
  @ApiResponse({ status: 200, description: 'Get all courses' })
  getCourses(): Promise<Course[]> {
    return this.courseService.getCourses();
  }

  @Get('/:id')
  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT)
  @ApiOperation({ summary: 'Get an course by id' })
  @ApiResponse({ status: 200, description: 'Get an course by id' })
  getCourse(@Param('id') id: string): Promise<Course | null> {
    return this.courseService.getCourse({ id });
  }

  @Post('/')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create an course' })
  @ApiResponse({ status: 201, description: 'Create an course' })
  createCourse(
    @Body() course: Prisma.CourseCreateInput & { institutionId: string },
  ): Promise<Course> {
    return this.courseService.createCourse(course);
  }

  @Put('/:id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update an course' })
  @ApiResponse({ status: 200, description: 'Update an course' })
  updateCourse(
    @Param('id') id: string,
    @Body() course: Prisma.CourseUpdateInput,
  ): Promise<Course> {
    return this.courseService.updateCourse({ where: { id }, data: course });
  }

  @Delete('/:id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete an course' })
  @ApiResponse({ status: 200, description: 'Delete an course' })
  deleteCourse(@Param('id') id: string): Promise<Course> {
    return this.courseService.deleteCourse({ id });
  }
}
