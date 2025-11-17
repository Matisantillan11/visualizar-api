import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Prisma, Role, type Book } from '@prisma/client';
import { PrismaService } from 'src/shared/database/prisma/prisma.service';
import { AuthenticatedUser } from '../auth/types/user.interface';
import { CreateBookRequestDto } from './dto/create-book-request.dto';

@Injectable()
export class BooksService {
  private readonly logger = new Logger(BooksService.name);

  constructor(private prisma: PrismaService) {}

  async getBook(
    bookWhereUniqueInput: Prisma.BookWhereUniqueInput,
  ): Promise<Book | null> {
    return this.prisma.book.findUnique({
      where: {
        ...bookWhereUniqueInput,
        deletedAt: null,
      },
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

  /**
   * Get books with role-based filtering
   *
   * Role-based access control:
   * - ADMIN: Can see all books
   * - TEACHER: Can only see books from courses they're assigned to
   * - STUDENT: Can only see books from courses they're enrolled in
   *
   * @param user - The authenticated user with role information
   * @returns Promise<Book[]> - Filtered list of books based on user role
   */
  async getBooks(user: AuthenticatedUser): Promise<Book[]> {
    // Base query conditions
    const baseWhere = {
      deletedAt: null,
    };

    // Role-based filtering
    if (user.role === Role.ADMIN) {
      // Admin can see all books
      return this.prisma.book.findMany({
        where: baseWhere,
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
    } else if (user.role === Role.TEACHER) {
      // Teacher can only see books from courses they're assigned to
      const teacher = await this.prisma.teacher.findUnique({
        where: { userId: user.id },
        include: {
          teacherCourse: {
            where: { deletedAt: null },
            select: { courseId: true },
          },
        },
      });

      if (!teacher) {
        return []; // Teacher not found, return empty array
      }

      const assignedCourseIds = teacher.teacherCourse.map((tc) => tc.courseId);

      if (assignedCourseIds.length === 0) {
        return []; // No courses assigned, return empty array
      }

      return this.prisma.book.findMany({
        where: {
          ...baseWhere,
          bookCourse: {
            some: {
              courseId: { in: assignedCourseIds },
              deletedAt: null,
            },
          },
        },
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
    } else if (user.role === Role.STUDENT) {
      // Student can only see books from courses they're enrolled in
      const student = await this.prisma.student.findUnique({
        where: { userId: user.id },
        include: {
          studentCourse: {
            where: { deletedAt: null },
            select: { courseId: true },
          },
        },
      });

      if (!student) {
        return []; // Student not found, return empty array
      }

      const enrolledCourseIds =
        student.studentCourse?.map((studentCourse) => studentCourse.courseId) ||
        [];

      if (enrolledCourseIds.length === 0) {
        return []; // No courses enrolled, return empty array
      }

      return this.prisma.book.findMany({
        where: {
          ...baseWhere,
          bookCourse: {
            some: {
              courseId: { in: enrolledCourseIds },
              deletedAt: null,
            },
          },
        },
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

    // Default fallback - return empty array for unknown roles
    return [];
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

    const { courseId, authorId, categoryId, releaseDate, ...bookData } = data;
    console.log(releaseDate);
    const course = await this.prisma.course.findUnique({
      where: { id: courseId, deletedAt: null },
    });

    if (!course) {
      throw new Error('Course not found');
    }

    const author = await this.prisma.author.findUnique({
      where: { id: authorId, deletedAt: null },
    });

    if (!author) {
      throw new Error('Author not found');
    }

    const category = await this.prisma.category.findUnique({
      where: { id: categoryId, deletedAt: null },
    });

    if (!category) {
      throw new Error('Category not found');
    }

    const bookCreation = await this.prisma.book.create({
      data: { ...bookData, is3dEnabled: false },
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
      where: { id: courseId, deletedAt: null },
    });

    if (!course) {
      throw new Error('Course not found');
    }

    const author = await this.prisma.author.findUnique({
      where: { id: authorId, deletedAt: null },
    });

    if (!author) {
      throw new Error('Author not found');
    }

    const category = await this.prisma.category.findUnique({
      where: { id: categoryId, deletedAt: null },
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
    return this.prisma.book.update({
      where,
      data: {
        deletedAt: new Date(),
      },
    });
  }

  /**
   * Get books for a specific course with role-based access control
   *
   * Role-based access control:
   * - ADMIN: Can access any course
   * - TEACHER: Can only access courses they're assigned to
   * - STUDENT: Can only access courses they're enrolled in
   *
   * @param courseId - The course ID to get books for
   * @param user - The authenticated user with role information
   * @returns Promise<Book[]> - Books for the specified course (if user has access)
   */
  async getBooksByCourseId(
    courseId: string,
    user: AuthenticatedUser,
  ): Promise<Book[]> {
    // Check if user has access to this course
    if (user.role === Role.TEACHER) {
      const teacher = await this.prisma.teacher.findUnique({
        where: { userId: user.id },
        include: {
          teacherCourse: {
            where: {
              deletedAt: null,
              courseId: courseId,
            },
          },
        },
      });

      if (!teacher || teacher.teacherCourse.length === 0) {
        return []; // Teacher not assigned to this course
      }
    } else if (user.role === Role.STUDENT) {
      const student = await this.prisma.student.findUnique({
        where: { userId: user.id },
        include: {
          studentCourse: {
            where: {
              deletedAt: null,
              courseId: courseId,
            },
          },
        },
      });

      if (!student || student.studentCourse?.length === 0) {
        return []; // Student not enrolled in this course
      }
    }
    // For ADMIN role, allow access to any course

    const response = await this.prisma.bookCourse.findMany({
      where: {
        deletedAt: null,
        courseId,
      },
      include: {
        book: {
          include: {
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
            bookCourse: {
              include: {
                course: true,
              },
            },
          },
        },
      },
    });

    return response.map(({ book }) => book).filter((book) => book !== null);
  }

  /**
   * Create a book request from a teacher
   *
   * @param createBookRequestDto - The book request data
   * @param user - The authenticated user (teacher)
   * @returns Promise with the created book request
   */
  async createBookRequest(
    createBookRequestDto: CreateBookRequestDto,
    user: AuthenticatedUser,
  ) {
    try {
      this.logger.log(`Creating book request for userId: ${user.id}`);
      console.log('📝 Creating book request for userId:', user.id);
      console.log(
        '📦 Request data:',
        JSON.stringify(createBookRequestDto, null, 2),
      );

      const { courseIds, title, authorName, comments, animations } =
        createBookRequestDto;

      // Validate that the user is a teacher
      if (user.role !== Role.TEACHER) {
        this.logger.warn(
          `User ${user.id} attempted to create book request but is not a teacher`,
        );
        throw new BadRequestException('Only teachers can create book requests');
      }

      // Validate that all courses exist
      const courses = await this.prisma.course.findMany({
        where: {
          id: { in: courseIds },
          deletedAt: null,
        },
      });

      if (courses.length !== courseIds.length) {
        const foundCourseIds = courses.map((c) => c.id);
        const missingCourseIds = courseIds.filter(
          (id) => !foundCourseIds.includes(id),
        );
        throw new BadRequestException(
          `Courses not found: ${missingCourseIds.join(', ')}`,
        );
      }

      // Create the book request with course relations
      this.logger.log(`Creating book request with ${courseIds.length} courses`);
      console.log('🔗 Creating book request with courses:', courseIds);

      const bookRequest = await this.prisma.bookRequest.create({
        data: {
          userId: user.id,
          title,
          authorName,
          comments,
          animations,
          bookRequestCourse: {
            create: courseIds.map((courseId) => ({
              courseId,
            })),
          },
        },
        include: {
          user: true,
          bookRequestCourse: {
            include: {
              course: true,
            },
          },
        },
      });

      this.logger.log(
        `Book request created successfully with id: ${bookRequest.id}`,
      );
      console.log('✅ Book request created successfully:', bookRequest.id);
      console.log(
        '📋 Created book request data:',
        JSON.stringify(bookRequest, null, 2),
      );

      return bookRequest;
    } catch (error) {
      // Re-throw NestJS exceptions as-is
      if (
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        this.logger.error(`Book request creation failed: ${error.message}`);
        console.error('❌ Book request creation failed:', error.message);
        throw error;
      }
      // Wrap other errors
      const err = error as Error;
      this.logger.error(`Unexpected error creating book request:`, err);
      console.error('❌ Unexpected error creating book request:', err);
      throw new InternalServerErrorException(
        `Failed to create book request: ${err.message}`,
      );
    }
  }

  /**
   * Get all book requests for a specific user
   *
   * @param userId - The user ID to get book requests for
   * @returns Promise with array of book requests
   */
  async getBookRequestsByUserId(user: AuthenticatedUser): Promise<any[]> {
    try {
      console.log(
        '🟢 Service - getBookRequestsByUserId called with user:',
        user,
      );
      this.logger.log(`Fetching book requests for userId: ${user.id}`);

      if (!user || !user.id) {
        throw new BadRequestException('User is required');
      }

      const bookRequests = await this.prisma.bookRequest.findMany({
        where: {
          userId: user.id,
          deletedAt: null,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
            },
          },
          bookRequestCourse: {
            where: {
              deletedAt: null,
            },
            include: {
              course: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      this.logger.log(
        `Found ${bookRequests.length} book requests for userId: ${user.id}`,
      );
      console.log('✅ Book requests found:', bookRequests.length);

      // Ensure we always return an array, even if empty
      return Array.isArray(bookRequests) ? bookRequests : [];
    } catch (error) {
      // Re-throw NestJS exceptions as-is
      if (
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        console.error('❌ NestJS Exception:', error.message);
        throw error;
      }
      // Wrap other errors
      const err = error as Error;
      this.logger.error(
        `Failed to fetch book requests for userId ${user?.id}:`,
        err.stack || err.message,
      );
      console.error('❌ Error fetching book requests:', err);
      console.error('❌ Error stack:', err.stack);
      throw new InternalServerErrorException(
        `Failed to fetch book requests: ${err.message}`,
      );
    }
  }
}
