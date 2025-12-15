import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  BookRequest,
  BookRequestStatus,
  Prisma,
  Role,
  type Book,
} from '@prisma/client';
import { PrismaService } from 'src/shared/database/prisma/prisma.service';
import { AuthenticatedUser } from '../auth/types/user.interface';
import { UsersService } from '../users/user.service';
import { BooksEmailService } from './books-email.service';
import { CreateBookRequestDto } from './dto/create-book-request.dto';
import { UpdateBookRequestStatusDto } from './dto/update-book-request-status.dto';

@Injectable()
export class BooksService {
  private readonly logger = new Logger(BooksService.name);

  constructor(
    private prisma: PrismaService,
    private booksEmailService: BooksEmailService,
    private usersService: UsersService,
  ) {}

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
      bookRequestId: string;
    },
    user: AuthenticatedUser,
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

    if (!data.bookRequestId) {
      throw new Error('Book Request ID is required');
    }

    const { courseId, authorId, categoryId, bookRequestId } = data;

    // Extract only the scalar fields we need for book creation
    const bookData: Prisma.BookUncheckedCreateInput = {
      name: data.name,
      description: data.description,
      imageUrl: data.imageUrl,
      animations: data.animations,
      bookRequestId: bookRequestId,
    };

    // Validate book request exists
    const bookRequest = await this.prisma.bookRequest.findUnique({
      where: { id: bookRequestId, deletedAt: null },
    });

    if (!bookRequest) {
      throw new Error('Book Request not found');
    }

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

    // Use transaction to ensure atomicity
    const result = await this.prisma.$transaction(async (prisma) => {
      // Create the book
      const bookCreation = await prisma.book.create({
        data: bookData,
      });

      // Create book course relation
      await prisma.bookCourse.create({
        data: {
          courseId,
          bookId: bookCreation.id,
        },
      });

      // Create book author relation
      await prisma.bookAuthor.create({
        data: {
          authorId,
          bookId: bookCreation.id,
        },
      });

      // Create book category relation
      await prisma.bookCategory.create({
        data: {
          categoryId,
          bookId: bookCreation.id,
        },
      });

      // Create audit record with bookRequestId
      await prisma.bookAudit.create({
        data: {
          title: bookCreation.name,
          author: author.name,
          description: bookCreation.description,
          imageUrl: bookCreation.imageUrl,
          category: category.name,
          animations: bookCreation.animations as Prisma.InputJsonValue[],
          courseIds: [courseId],
          userId: user.id,
          bookId: bookCreation.id,
          bookRequestId: bookRequestId,
          action: 'CREATED',
        },
      });

      // Update book request status to PUBLISHED
      await prisma.bookRequest.update({
        where: { id: bookRequestId },
        data: { status: BookRequestStatus.PUBLISHED },
      });

      // Create status audit record for the book request
      await prisma.bookRequestStatusAudit.create({
        data: {
          userId: user.id,
          bookRequestId: bookRequestId,
          previousStatus: bookRequest.status,
          currentStatus: BookRequestStatus.PUBLISHED,
        },
      });

      return bookCreation;
    });

    return result;
  }

  async updateBook(
    params: {
      where: Prisma.BookWhereUniqueInput;
      data: Prisma.BookUpdateInput & {
        courseId: string;
        authorId: string;
        categoryId: string;
      };
    },
    user: AuthenticatedUser,
  ): Promise<Book> {
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

      // Create audit record
      await this.prisma.bookAudit.create({
        data: {
          title: bookUpdate.name,
          author: author.name,
          description: bookUpdate.description,
          imageUrl: bookUpdate.imageUrl,
          category: category.name,
          animations: bookUpdate.animations as Prisma.InputJsonValue[],
          courseIds: [courseId],
          userId: user.id,
          bookId: bookUpdate.id,
          action: 'UPDATED',
        },
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

      // Send email notifications asynchronously (don't wait for them)
      // This ensures that email failures don't block the book request creation
      this.sendBookRequestEmails(bookRequest, user).catch((error) => {
        this.logger.error(
          `Failed to send book request emails: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      });

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
   * Send email notifications for a newly created book request
   * This is called asynchronously after book request creation
   */
  private async sendBookRequestEmails(
    bookRequest: {
      id: string;
      title: string;
      authorName: string;
      comments: string | null;
      animations: any[];
      createdAt: Date;
      bookRequestCourse: Array<{
        course: {
          name: string;
        };
      }>;
    },
    user: AuthenticatedUser,
  ): Promise<void> {
    try {
      // Get all admin emails
      const adminEmails = await this.usersService.getAdminEmails();

      if (adminEmails.length > 0) {
        // Send notification to admins
        await this.booksEmailService.sendBookRequestNotificationToAdmins(
          adminEmails,
          {
            id: bookRequest.id,
            title: bookRequest.title,
            authorName: bookRequest.authorName,
            teacherName: user.name || 'Unknown Teacher',
            teacherEmail: user.email,
            courses: bookRequest.bookRequestCourse.map((brc) => ({
              name: brc.course.name,
            })),
            comments: bookRequest.comments ?? undefined,
            animations:
              bookRequest.animations.length > 0
                ? bookRequest.animations.join(', ')
                : undefined,
            createdAt: bookRequest.createdAt,
          },
        );

        this.logger.log(
          `Sent book request notification to ${adminEmails.length} admin(s)`,
        );
      }

      // Send confirmation to teacher
      await this.booksEmailService.sendBookRequestConfirmationToTeacher(
        user.email,
        user.name || 'Teacher',
        {
          id: bookRequest.id,
          title: bookRequest.title,
          authorName: bookRequest.authorName,
          courses: bookRequest.bookRequestCourse.map((brc) => ({
            name: brc.course.name,
          })),
          createdAt: bookRequest.createdAt,
        },
      );

      this.logger.log(
        `Sent book request confirmation to teacher ${user.email}`,
      );
    } catch (error) {
      // Log the error but don't throw - we don't want email failures to affect the book request
      this.logger.error(
        `Error sending book request emails: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
  /**
   * Get all book requests for a specific user
   *
   * @param user - The user to get book requests for
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

  /**
   * Get all book requests for a specific user
   *
   * @param user - The user to get book requests for
   * @returns Promise with array of book requests
   */
  async getAllBookRequests(user: AuthenticatedUser): Promise<any[]> {
    try {
      console.log('🟢 Service - getAllBookRequests called with user:', user);
      this.logger.log(`Fetching book requests for userId: ${user.id}`);

      if (!user || !user.id) {
        throw new BadRequestException('User is required');
      }

      if (user.role !== Role.ADMIN) {
        throw new BadRequestException('Only admins can get all book requests');
      }

      const bookRequests = await this.prisma.bookRequest.findMany({
        where: {
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
              bookRequest: true,
              course: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      this.logger.log(`Found ${bookRequests.length} book requests`);
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
        `Failed to fetch book requests:`,
        err.stack || err.message,
      );
      console.error('❌ Error fetching book requests:', err);
      console.error('❌ Error stack:', err.stack);
      throw new InternalServerErrorException(
        `Failed to fetch book requests: ${err.message}`,
      );
    }
  }

  /**
   * Get a book request by its ID
   *
   * @param requestId - The ID of the book request
   * @returns Promise with the book request
   */
  async getBookRequestByRequestId(
    requestId: string,
  ): Promise<BookRequest | (BookRequest & { authorId: string }) | null> {
    const bookRequest = await this.prisma.bookRequest.findUnique({
      where: {
        id: requestId,
        deletedAt: null,
      },
      include: {
        bookRequestCourse: {
          where: {
            deletedAt: null,
          },
        },
      },
    });

    if (bookRequest) {
      const author = await this.prisma.author.findFirst({
        where: {
          name: bookRequest.authorName,
        },
      });

      if (author) {
        return {
          ...bookRequest,
          authorId: author.id,
        };
      }
    }

    return bookRequest;
  }

  /**
   * Update the status of a book request with state transition validation
   *
   * State transition rules:
   * - PENDING → APPROVED or DENIED
   * - APPROVED → PUBLISHED
   * - DENIED → (terminal state, no transitions allowed)
   * - PUBLISHED → (terminal state, no transitions allowed)
   *
   * @param id - The book request ID
   * @param updateDto - The new status
   * @param user - The authenticated user (must be ADMIN)
   * @returns Promise with the updated book request
   */
  async updateBookRequestStatus(
    id: string,
    updateDto: UpdateBookRequestStatusDto,
    user: AuthenticatedUser,
  ) {
    try {
      this.logger.log(
        `Updating book request ${id} status to ${updateDto.status}`,
      );

      // Only admins can update book request status
      if (user.role !== Role.ADMIN) {
        throw new BadRequestException(
          'Only admins can update book request status',
        );
      }

      // Get the current book request
      const bookRequest = await this.prisma.bookRequest.findUnique({
        where: { id, deletedAt: null },
      });

      if (!bookRequest) {
        throw new NotFoundException(`Book request with id ${id} not found`);
      }

      const currentStatus = bookRequest.status;
      const newStatus = updateDto.status;

      // Validate state transitions
      const validTransitions: Record<BookRequestStatus, BookRequestStatus[]> = {
        [BookRequestStatus.PENDING]: [
          BookRequestStatus.APPROVED,
          BookRequestStatus.DENIED,
        ],
        [BookRequestStatus.APPROVED]: [BookRequestStatus.PUBLISHED],
        [BookRequestStatus.DENIED]: [],
        [BookRequestStatus.PUBLISHED]: [],
      };

      const allowedTransitions = validTransitions[currentStatus];

      if (!allowedTransitions.includes(newStatus)) {
        throw new BadRequestException(
          `Invalid status transition from ${currentStatus} to ${newStatus}. ` +
            `Allowed transitions: ${allowedTransitions.length > 0 ? allowedTransitions.join(', ') : 'none (terminal state)'}`,
        );
      }

      // Update the status and create audit record in a transaction

      const result = await this.prisma.$transaction([
        // Update the book request status
        this.prisma.bookRequest.update({
          where: { id },
          data: { status: newStatus },
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
        }),
        // Create audit record

        this.prisma.bookRequestStatusAudit.create({
          data: {
            userId: user.id,
            bookRequestId: id,
            previousStatus: currentStatus,
            currentStatus: newStatus,
          },
        }),
      ]);

      const updatedBookRequest = result[0];
      const auditRecord = result[1];

      this.logger.log(
        `Book request ${id} status updated from ${currentStatus} to ${newStatus} by user ${user.id}`,
      );
      this.logger.log(`Audit record created with id: ${auditRecord.id}`);

      return updatedBookRequest;
    } catch (error) {
      // Re-throw NestJS exceptions as-is
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      // Wrap other errors
      const err = error as Error;
      this.logger.error(`Failed to update book request status:`, err);
      throw new InternalServerErrorException(
        `Failed to update book request status: ${err.message}`,
      );
    }
  }
}
