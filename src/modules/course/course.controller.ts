import {
  Controller,
  Post,
  Body,
  Put,
  Delete,
  Get,
  Param,
} from '@nestjs/common';
import { Course, Prisma } from '@prisma/client';
import { CourseService } from './course.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('/api/courses')
@ApiTags('Courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get('/')
  @ApiOperation({ summary: 'Get all courses' })
  @ApiResponse({ status: 200, description: 'Get all courses' })
  getCourses(): Promise<Course[]> {
    return this.courseService.getCourses();
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Get an course by id' })
  @ApiResponse({ status: 200, description: 'Get an course by id' })
  getCourse(@Param('id') id: string): Promise<Course | null> {
    return this.courseService.getCourse({ id });
  }

  @Post('/')
  @ApiOperation({ summary: 'Create an course' })
  @ApiResponse({ status: 201, description: 'Create an course' })
  createCourse(
    @Body() course: Prisma.CourseCreateInput & { institutionId: string },
  ): Promise<Course> {
    return this.courseService.createCourse(course);
  }

  @Put('/:id')
  @ApiOperation({ summary: 'Update an course' })
  @ApiResponse({ status: 200, description: 'Update an course' })
  updateCourse(
    @Param('id') id: string,
    @Body() course: Prisma.CourseUpdateInput,
  ): Promise<Course> {
    return this.courseService.updateCourse({ where: { id }, data: course });
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Delete an course' })
  @ApiResponse({ status: 200, description: 'Delete an course' })
  deleteCourse(@Param('id') id: string): Promise<Course> {
    return this.courseService.deleteCourse({ id });
  }
}
