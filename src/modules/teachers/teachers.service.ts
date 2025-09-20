import { Injectable } from '@nestjs/common';
import { Prisma, Teacher, TeacherCourse } from '@prisma/client';
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
            teacher: {
              include: {
                user: true,
              },
            },
            course: true,
          },
        },
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
      courseId: string;
    };
  }): Promise<TeacherCourse> {
    const { data } = params;
    if (!data) {
      throw new Error('Teacher not found');
    }

    const teacher = await this.getTeacher({ id: data.teacherId });
    if (!teacher) {
      throw new Error('Teacher not found');
    }

    const course = await this.prisma.course.findUnique({
      where: { id: data.courseId, deletedAt: null },
    });
    if (!course) {
      throw new Error('Course not found');
    }

    return await this.prisma.teacherCourse.create({ data });
  }
}
