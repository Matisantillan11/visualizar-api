import { Injectable } from '@nestjs/common';
import { Prisma, type Author } from 'src/shared/database/generated/client';
import { PrismaService } from 'src/shared/database/prisma/prisma.service';

@Injectable()
export class AuthorService {
  constructor(private prisma: PrismaService) {}

  async getAuthor(
    authorWhereUniqueInput: Prisma.AuthorWhereUniqueInput,
  ): Promise<Author | null> {
    return this.prisma.author.findUnique({
      where: {
        ...authorWhereUniqueInput,
        deletedAt: null,
      },
    });
  }

  async getAuthors(): Promise<Author[]> {
    return this.prisma.author.findMany({
      where: {
        deletedAt: null,
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
    return this.prisma.author.update({
      where,
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
