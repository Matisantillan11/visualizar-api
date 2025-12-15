import { Injectable } from '@nestjs/common';
import { Prisma, type Course } from '@prisma/client';
import { PrismaService } from 'src/shared/database/prisma/prisma.service';

@Injectable()
export class CourseService {
  constructor(private prisma: PrismaService) {}

  async getCourse(
    courseWhereUniqueInput: Prisma.CourseWhereUniqueInput,
  ): Promise<Course | null> {
    return this.prisma.course.findUnique({
      where: {
        ...courseWhereUniqueInput,
        deletedAt: null,
      },
      include: {
        InstitutionCourse: {
          where: {
            deletedAt: null,
          },
          include: {
            institution: true,
          },
        },
      },
    });
  }

  async getCourses(): Promise<Course[]> {
    return this.prisma.course.findMany({
      where: {
        deletedAt: null,
      },
    });
  }

  async createCourse(
    data: Prisma.CourseCreateInput & { institutionId: string },
  ): Promise<Course> {
    if (!data.institutionId) {
      throw new Error('Institution ID is required');
    }
    const { institutionId, ...courseData } = data;
    const courseCreation = await this.prisma.course.create({
      data: courseData,
    });

    if (courseCreation) {
      await this.prisma.institutionCourse.create({
        data: {
          institutionId: institutionId,
          courseId: courseCreation.id,
        },
      });

      return courseCreation;
    } else {
      throw new Error('Course not created');
    }
  }

  async updateCourse(params: {
    where: Prisma.CourseWhereUniqueInput;
    data: Prisma.CourseUpdateInput & {
      institutionId: string;
      institutionCourseId: string;
    };
  }): Promise<Course> {
    const { where, data } = params;
    const { institutionId, institutionCourseId, ...courseData } = data;

    if (institutionId) {
      await this.prisma.institutionCourse.update({
        where: {
          id: institutionCourseId,
        },
        data: {
          institutionId,
        },
      });
    }
    return this.prisma.course.update({ data: courseData, where });
  }

  async deleteCourse(where: Prisma.CourseWhereUniqueInput): Promise<Course> {
    return this.prisma.course.update({
      where,
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async getCoursesOfTeacher(teacherId: string): Promise<Course[]> {
    const coursesAssigned = await this.prisma.teacherCourse.findMany({
      select: {
        courseId: true,
      },
      where: {
        deletedAt: null,
        teacherId,
      },
    });

    const courses = await this.prisma.course.findMany({
      where: {
        deletedAt: null,
        id: { in: coursesAssigned.map((course) => course.courseId) },
      },
    });

    return courses;
  }
}
