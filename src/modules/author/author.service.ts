import { Injectable } from '@nestjs/common';
import { Prisma, Author } from '@prisma/client';
import { PrismaService } from 'src/shared/database/prisma/prisma.service';

@Injectable()
export class AuthorService {
  constructor(private prisma: PrismaService) {}

  async getAuthor(
    authorWhereUniqueInput: Prisma.AuthorWhereUniqueInput,
  ): Promise<Author | null> {
    return this.prisma.author.findUnique({
      where: authorWhereUniqueInput,
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

  async getAuthors(): Promise<Author[]> {
    return this.prisma.author.findMany({
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

  async createAuthor(data: Prisma.AuthorCreateInput): Promise<Author> {
    return this.prisma.author.create({ data });
  }

  async updateAuthor(params: {
    where: Prisma.AuthorWhereUniqueInput;
    data: Prisma.AuthorUpdateInput;
  }): Promise<Author> {
    const { where, data } = params;
    return this.prisma.author.update({ data, where });
  }

  async deleteAuthor(where: Prisma.AuthorWhereUniqueInput): Promise<Author> {
    return this.prisma.author.delete({ where });
  }
}
