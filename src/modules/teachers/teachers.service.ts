import { Injectable } from '@nestjs/common';
import { Prisma, type Teacher, type TeacherCourse } from '@prisma/client';
import { PrismaService } from 'src/shared/database/prisma/prisma.service';

@Injectable()
export class TeachersService {
  constructor(private prisma: PrismaService) {}

  async getTeacher(
    teacherWhereUniqueInput: Prisma.TeacherWhereUniqueInput,
  ): Promise<Teacher | null> {
    return await this.prisma.teacher.findUnique({
      where: {
        ...teacherWhereUniqueInput,
        deletedAt: null,
      },
      include: {
        user: true,
      },
    });
  }

  async getTeachers(): Promise<Teacher[]> {
    return await this.prisma.teacher.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        teacherCourse: {
          include: {
            course: true,
          },
        },
        user: true,
      },
    });
  }

  async createTeacher(data: Prisma.TeacherCreateInput): Promise<Teacher> {
    return await this.prisma.teacher.create({ data });
  }

  async updateTeacher(params: {
    where: Prisma.TeacherWhereUniqueInput;
    data: Prisma.TeacherUpdateInput;
  }): Promise<Teacher> {
    const { where, data } = params;
    return await this.prisma.teacher.update({ data, where });
  }

  async deleteTeacher(where: Prisma.TeacherWhereUniqueInput): Promise<Teacher> {
    return await this.prisma.teacher.update({
      where,
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async assignCourseToTeacher(params: {
    data: {
      teacherId: string;
      courseIds: Array<string>;
    };
  }): Promise<Array<TeacherCourse>> {
    const { data } = params;
    if (!data.teacherId || !data.courseIds) {
      throw new Error('Teacher or courseIds not found');
    }

    const teacher = await this.getTeacher({ id: data.teacherId });
    if (!teacher) {
      throw new Error('Teacher not found');
    }

    const courses = await this.prisma.course.findMany({
      where: {
        deletedAt: null,
        id: {
          in: data.courseIds,
        },
      },
    });

    if (!courses) {
      throw new Error('Course not found');
    }

    const payload = courses.map((course) => ({
      teacherId: data.teacherId,
      courseId: course.id,
    }));

    const teacherCourses = await this.prisma.teacherCourse.createManyAndReturn({
      data: payload,
    });

    return teacherCourses;
  }
}
