import { Injectable } from '@nestjs/common';
import { Prisma, Student } from '@prisma/client';
import { PrismaService } from 'src/shared/database/prisma/prisma.service';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  async getStudent(
    studentWhereUniqueInput: Prisma.StudentWhereUniqueInput,
  ): Promise<Student | null> {
    return this.prisma.student.findUnique({
      where: studentWhereUniqueInput,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            dni: true,
          },
        },
      },
    });
  }

  async getStudents(): Promise<Student[]> {
    return this.prisma.student.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            dni: true,
          },
        },
      },
    });
  }

  async createStudent(data: Prisma.StudentCreateInput): Promise<Student> {
    return this.prisma.student.create({ data });
  }

  async updateStudent(params: {
    where: Prisma.StudentWhereUniqueInput;
    data: Prisma.StudentUpdateInput;
  }): Promise<Student> {
    const { where, data } = params;
    return this.prisma.student.update({ data, where });
  }

  async deleteStudent(where: Prisma.StudentWhereUniqueInput): Promise<Student> {
    return this.prisma.student.delete({ where });
  }
}
