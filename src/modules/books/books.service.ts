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
      },
    });
  }

  async getCourses(): Promise<Book[]> {
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
      },
    });
  }

  async createBook(
    data: Prisma.BookCreateInput & { courseId: string; authorId: string },
  ): Promise<Book> {
    if (!data.courseId) {
      throw new Error('Course ID is required');
    }

    if (!data.authorId) {
      throw new Error('Author ID is required');
    }

    const { courseId, authorId, ...bookData } = data;
    const bookCreation = await this.prisma.book.create({
      data: bookData,
    });

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

      return bookCreation;
    } else {
      throw new Error('Book not created');
    }
  }

  async updateBook(params: {
    where: Prisma.BookWhereUniqueInput;
    data: Prisma.BookUpdateInput;
  }): Promise<Book> {
    const { where, data } = params;
    return this.prisma.book.update({ data, where });
  }

  async deleteBook(where: Prisma.BookWhereUniqueInput): Promise<Book> {
    return this.prisma.book.delete({ where });
  }
}
