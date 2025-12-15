import { Injectable } from '@nestjs/common';
import { type User, Prisma, Role } from '@prisma/client';
import { PrismaService } from 'src/shared/database/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getUser(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: {
        ...userWhereUniqueInput,
        deletedAt: null,
      },
    });
  }

  async getUsers(): Promise<User[]> {
    return this.prisma.user.findMany({
      where: {
        deletedAt: null,
      },
    });
  }

  /**
   * Get all admin user emails
   * @returns Promise<string[]> - Array of admin email addresses
   */
  async getAdminEmails(): Promise<string[]> {
    const admins = await this.prisma.user.findMany({
      where: {
        role: Role.ADMIN,
        deletedAt: null,
      },
      select: {
        email: true,
      },
    });

    return admins.map((admin) => admin.email);
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async updateUser(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }): Promise<User> {
    const { where, data } = params;
    return this.prisma.user.update({
      data,
      where,
    });
  }

  async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where,
    });

    if (user?.role === Role.TEACHER) {
      const teacher = await this.prisma.teacher.findUnique({
        where: {
          userId: user.id,
        },
      });

      if (teacher) {
        await this.prisma.teacher.update({
          where: {
            userId: user.id,
          },
          data: {
            deletedAt: new Date(),
          },
        });
      }
    }

    if (user?.role === Role.STUDENT) {
      const student = await this.prisma.student.findUnique({
        where: {
          userId: user.id,
        },
      });

      if (student) {
        await this.prisma.student.update({
          where: {
            userId: user.id,
          },
          data: {
            deletedAt: new Date(),
          },
        });
      }
    }

    return this.prisma.user.update({
      where,
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
