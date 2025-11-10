import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { type Book, Prisma, Role } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/types/user.interface';
import { BooksService } from './books.service';
import { CreateBookRequestDto } from './dto/create-book-request.dto';

@Controller('/api/books')
@ApiTags('Books')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get('/')
  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT)
  @ApiOperation({ summary: 'Get all books' })
  @ApiResponse({ status: 200, description: 'Get all books' })
  getBooks(@CurrentUser() user: AuthenticatedUser): Promise<Book[]> {
    return this.booksService.getBooks(user);
  }

  @Get('/:id')
  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT)
  @ApiOperation({ summary: 'Get an book by id' })
  @ApiResponse({ status: 200, description: 'Get an book by id' })
  getBook(@Param('id') id: string): Promise<Book | null> {
    return this.booksService.getBook({ id });
  }

  @Post('/')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Create an book' })
  @ApiResponse({ status: 201, description: 'Create an book' })
  createBook(
    @Body()
    book: Prisma.BookCreateInput & {
      courseId: string;
      authorId: string;
      categoryId: string;
    },
  ): Promise<Book> {
    return this.booksService.createBook(book);
  }

  @Put('/:id')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Update an book' })
  @ApiResponse({ status: 200, description: 'Update an book' })
  updateBook(
    @Param('id') id: string,
    @Body()
    book: Prisma.BookUpdateInput & {
      courseId: string;
      authorId: string;
      categoryId: string;
    },
  ): Promise<Book> {
    return this.booksService.updateBook({ where: { id }, data: book });
  }

  @Delete('/:id')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Delete an book' })
  @ApiResponse({ status: 200, description: 'Delete an book' })
  deleteBook(@Param('id') id: string): Promise<Book> {
    return this.booksService.deleteBook({ id });
  }

  @Get('/course/:courseId')
  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT)
  @ApiOperation({ summary: 'Get books of a course' })
  @ApiResponse({ status: 200, description: 'Get books of a course' })
  getBooksOfCourse(
    @Param('courseId') courseId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Book[]> {
    return this.booksService.getBooksByCourseId(courseId, user);
  }

  @Post('/request')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Create a book request' })
  @ApiResponse({
    status: 201,
    description: 'Book request created successfully',
  })
  createBookRequest(
    @Body() createBookRequestDto: CreateBookRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.booksService.createBookRequest(createBookRequestDto, user);
  }
}
