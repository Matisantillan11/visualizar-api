import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { type Category, Prisma } from '@prisma/client';
import { PrismaService } from 'src/shared/database/prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async getCategory(
    categoryWhereUniqueInput: Prisma.CategoryWhereUniqueInput,
  ): Promise<Category | null> {
    return this.prisma.category.findUnique({
      where: {
        ...categoryWhereUniqueInput,
        deletedAt: null,
      },
    });
  }

  async getCategories(): Promise<Category[]> {
    return this.prisma.category.findMany({
      where: {
        deletedAt: null,
      },
    });
  }

  async createCategory(data: Prisma.CategoryCreateInput): Promise<Category> {
    return this.prisma.category.create({ data });
  }

  async updateCategory(params: {
    where: Prisma.CategoryWhereUniqueInput;
    data: Prisma.CategoryUpdateInput;
  }): Promise<Category> {
    const { where, data } = params;
    return this.prisma.category.update({ data, where });
  }

  async deleteCategory(
    where: Prisma.CategoryWhereUniqueInput,
  ): Promise<Category> {
    const categoryId = where.id;

    const bookAssigned = await this.prisma.bookCategory.findMany({
      where: {
        categoryId,
      },
    });

    if (bookAssigned.length > 0) {
      throw new InternalServerErrorException('Category has assigned books');
    }

    return this.prisma.category.update({
      where,
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
