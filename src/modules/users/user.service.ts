import { Injectable } from '@nestjs/common';
import { type User, Prisma } from 'src/shared/database/generated/client';
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
    return this.prisma.user.update({
      where,
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
