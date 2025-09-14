import {
  Controller,
  Post,
  Body,
  Put,
  Delete,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { Book, Prisma, Role } from '@prisma/client';
import { BooksService } from './books.service';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

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
  getBooks(): Promise<Book[]> {
    return this.booksService.getBooks();
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
}
