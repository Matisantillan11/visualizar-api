import { Injectable } from '@nestjs/common';
import { Prisma, Book } from '@prisma/client';
import { PrismaService } from 'src/shared/database/prisma/prisma.service';

@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) {}

  async getBook(
    bookWhereUniqueInput: Prisma.BookWhereUniqueInput,
  ): Promise<Book | null> {
    return this.prisma.book.findUnique({
      where: bookWhereUniqueInput,
      include: {
        bookCourse: {
          include: {
            course: true,
          },
        },
        bookAuthor: {
          include: {
            author: true,
          },
        },
        bookCategory: {
          include: {
            category: true,
          },
        },
      },
    });
  }

  async getBooks(): Promise<Book[]> {
    return this.prisma.book.findMany({
      include: {
        bookCourse: {
          include: {
            course: true,
          },
        },
        bookAuthor: {
          include: {
            author: true,
          },
        },
        bookCategory: {
          include: {
            category: true,
          },
        },
      },
    });
  }

  async createBook(
    data: Prisma.BookCreateInput & {
      courseId: string;
      authorId: string;
      categoryId: string;
    },
  ): Promise<Book> {
    if (!data.courseId) {
      throw new Error('Course ID is required');
    }

    if (!data.authorId) {
      throw new Error('Author ID is required');
    }

    if (!data.categoryId) {
      throw new Error('Category ID is required');
    }

    const { courseId, authorId, categoryId, ...bookData } = data;

    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new Error('Course not found');
    }

    const author = await this.prisma.author.findUnique({
      where: { id: authorId },
    });

    if (!author) {
      throw new Error('Author not found');
    }

    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new Error('Category not found');
    }

    const bookCreation = await this.prisma.book.create({
      data: bookData,
    });

    if (bookCreation) {
      await this.prisma.bookCourse.create({
        data: {
          courseId,
          bookId: bookCreation.id,
        },
      });

      await this.prisma.bookAuthor.create({
        data: {
          authorId,
          bookId: bookCreation.id,
        },
      });

      await this.prisma.bookCategory.create({
        data: {
          categoryId,
          bookId: bookCreation.id,
        },
      });

      return bookCreation;
    } else {
      throw new Error('Book not created');
    }
  }

  async updateBook(params: {
    where: Prisma.BookWhereUniqueInput;
    data: Prisma.BookUpdateInput & {
      courseId: string;
      authorId: string;
      categoryId: string;
    };
  }): Promise<Book> {
    const { where, data } = params;
    if (!data.courseId) {
      throw new Error('Course ID is required');
    }

    if (!data.authorId) {
      throw new Error('Author ID is required');
    }

    if (!data.categoryId) {
      throw new Error('Category ID is required');
    }

    const { courseId, authorId, categoryId, ...bookData } = data;
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new Error('Course not found');
    }

    const author = await this.prisma.author.findUnique({
      where: { id: authorId },
    });

    if (!author) {
      throw new Error('Author not found');
    }

    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new Error('Category not found');
    }

    const bookUpdate = await this.prisma.book.update({
      data: bookData,
      where,
      include: {
        bookCourse: true,
        bookAuthor: true,
        bookCategory: true,
      },
    });

    if (bookUpdate) {
      await this.prisma.bookCourse.update({
        where: { id: bookUpdate.bookCourse[0].id },
        data: { courseId, bookId: bookUpdate.id },
      });

      await this.prisma.bookAuthor.update({
        where: { id: bookUpdate.bookAuthor[0].id },
        data: { authorId, bookId: bookUpdate.id },
      });

      await this.prisma.bookCategory.update({
        where: { id: bookUpdate.bookCategory[0].id },
        data: { categoryId, bookId: bookUpdate.id },
      });

      return bookUpdate;
    }

    throw new Error('Book not updated');
  }

  async deleteBook(where: Prisma.BookWhereUniqueInput): Promise<Book> {
    return this.prisma.book.delete({ where });
  }
}
