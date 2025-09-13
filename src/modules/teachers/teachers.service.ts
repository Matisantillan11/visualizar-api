import { Injectable } from '@nestjs/common';
import { Prisma, Teacher } from '@prisma/client';
import { PrismaService } from 'src/shared/database/prisma/prisma.service';

@Injectable()
export class TeachersService {
  constructor(private prisma: PrismaService) {}

  async getTeacher(
    teacherWhereUniqueInput: Prisma.TeacherWhereUniqueInput,
  ): Promise<Teacher | null> {
    return await this.prisma.teacher.findUnique({
      where: teacherWhereUniqueInput,
      include: {
        user: true,
      },
    });
  }

  async getTeachers(): Promise<Teacher[]> {
    return await this.prisma.teacher.findMany({
      include: {
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
    return await this.prisma.teacher.delete({ where });
  }
}
