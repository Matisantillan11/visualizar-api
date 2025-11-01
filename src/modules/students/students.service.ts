import { Injectable } from '@nestjs/common';
import { Prisma, type Student, type StudentCourse } from '@prisma/client';
import { PrismaService } from 'src/shared/database/prisma/prisma.service';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  async getStudent(
    studentWhereUniqueInput: Prisma.StudentWhereUniqueInput,
  ): Promise<Student | null> {
    return this.prisma.student.findUnique({
      where: {
        ...studentWhereUniqueInput,
        deletedAt: null,
      },
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
      where: {
        deletedAt: null,
      },
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
    return this.prisma.student.update({
      where,
      data: {
        deletedAt: new Date(),
      },
    });
  }

  /**
   * Assign courses to a student
   *
   * @param params - Object containing studentId and array of courseIds
   * @returns Promise<Array<StudentCourse>> - Array of created StudentCourse relationships
   */
  async assignCourseToStudent(params: {
    data: {
      studentId: string;
      courseIds: Array<string>;
    };
  }): Promise<Array<StudentCourse>> {
    const { data } = params;
    if (!data.studentId || !data.courseIds) {
      throw new Error('Student ID or course IDs not provided');
    }

    // Verify student exists
    const student = await this.getStudent({ id: data.studentId });
    if (!student) {
      throw new Error('Student not found');
    }

    // Verify courses exist
    const courses = await this.prisma.course.findMany({
      where: {
        deletedAt: null,
        id: {
          in: data.courseIds,
        },
      },
    });

    if (courses.length !== data.courseIds.length) {
      throw new Error('One or more courses not found');
    }

    // Check for existing enrollments to avoid duplicates
    const existingEnrollments = await this.prisma.studentCourse.findMany({
      where: {
        studentId: data.studentId,
        courseId: { in: data.courseIds },
        deletedAt: null,
      },
    });

    const existingCourseIds = existingEnrollments.map(
      (enrollment) => enrollment.courseId,
    );
    const newCourseIds = data.courseIds.filter(
      (courseId) => !existingCourseIds.includes(courseId),
    );

    if (newCourseIds.length === 0) {
      throw new Error('Student is already enrolled in all specified courses');
    }

    // Create new enrollments
    const payload = newCourseIds.map((courseId) => ({
      studentId: data.studentId,
      courseId: courseId,
    }));

    const studentCourses = await this.prisma.studentCourse.createManyAndReturn({
      data: payload,
    });

    return studentCourses;
  }

  /**
   * Get courses assigned to a student
   *
   * @param studentId - The student ID
   * @returns Promise<Array<Course>> - Array of courses the student is enrolled in
   */
  async getCoursesOfStudent(studentId: string): Promise<Array<any>> {
    const coursesAssigned = await this.prisma.studentCourse.findMany({
      select: {
        courseId: true,
      },
      where: {
        deletedAt: null,
        studentId,
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

  /**
   * Remove a student from a course (soft delete)
   *
   * @param params - Object containing studentId and courseId
   * @returns Promise<StudentCourse> - Updated StudentCourse relationship
   */
  async removeStudentFromCourse(params: {
    data: {
      studentId: string;
      courseId: string;
    };
  }): Promise<StudentCourse> {
    const { data } = params;
    if (!data.studentId || !data.courseId) {
      throw new Error('Student ID or course ID not provided');
    }

    const enrollment = await this.prisma.studentCourse.findFirst({
      where: {
        studentId: data.studentId,
        courseId: data.courseId,
        deletedAt: null,
      },
    });

    if (!enrollment) {
      throw new Error('Student enrollment not found');
    }

    return this.prisma.studentCourse.update({
      where: { id: enrollment.id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
