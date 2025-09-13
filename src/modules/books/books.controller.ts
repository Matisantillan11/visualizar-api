import {
  Controller,
  Post,
  Body,
  Put,
  Delete,
  Get,
  Param,
} from '@nestjs/common';
import { Book, Prisma } from '@prisma/client';
import { BooksService } from './books.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('/api/books')
@ApiTags('Books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get('/')
  @ApiOperation({ summary: 'Get all books' })
  @ApiResponse({ status: 200, description: 'Get all books' })
  getBooks(): Promise<Book[]> {
    return this.booksService.getCourses();
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Get an book by id' })
  @ApiResponse({ status: 200, description: 'Get an book by id' })
  getBook(@Param('id') id: string): Promise<Book | null> {
    return this.booksService.getBook({ id });
  }

  @Post('/')
  @ApiOperation({ summary: 'Create an book' })
  @ApiResponse({ status: 201, description: 'Create an book' })
  createBook(
    @Body()
    book: Prisma.BookCreateInput & { courseId: string; authorId: string },
  ): Promise<Book> {
    return this.booksService.createBook(book);
  }

  @Put('/:id')
  @ApiOperation({ summary: 'Update an book' })
  @ApiResponse({ status: 200, description: 'Update an book' })
  updateBook(
    @Param('id') id: string,
    @Body() book: Prisma.BookUpdateInput,
  ): Promise<Book> {
    return this.booksService.updateBook({ where: { id }, data: book });
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Delete an book' })
  @ApiResponse({ status: 200, description: 'Delete an book' })
  deleteBook(@Param('id') id: string): Promise<Book> {
    return this.booksService.deleteBook({ id });
  }
}
