import {
  Controller,
  Post,
  Body,
  Put,
  Delete,
  Get,
  Param,
} from '@nestjs/common';
import { Author, Prisma } from '@prisma/client';
import { AuthorService } from './author.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('/api/authors')
@ApiTags('Authors')
export class AuthorController {
  constructor(private readonly authorService: AuthorService) {}

  @Get('/')
  @ApiOperation({ summary: 'Get all authors' })
  @ApiResponse({ status: 200, description: 'Get all authors' })
  getAuthors(): Promise<Author[]> {
    return this.authorService.getAuthors();
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Get an author by id' })
  @ApiResponse({ status: 200, description: 'Get an author by id' })
  getAuthor(@Param('id') id: string): Promise<Author | null> {
    return this.authorService.getAuthor({ id });
  }

  @Post('/')
  @ApiOperation({ summary: 'Create an author' })
  @ApiResponse({ status: 201, description: 'Create an author' })
  createAuthor(@Body() author: Prisma.AuthorCreateInput): Promise<Author> {
    return this.authorService.createAuthor(author);
  }

  @Put('/:id')
  @ApiOperation({ summary: 'Update an author' })
  @ApiResponse({ status: 200, description: 'Update an author' })
  updateAuthor(
    @Param('id') id: string,
    @Body() author: Prisma.AuthorUpdateInput,
  ): Promise<Author> {
    return this.authorService.updateAuthor({ where: { id }, data: author });
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Delete an author' })
  @ApiResponse({ status: 200, description: 'Delete an author' })
  deleteAuthor(@Param('id') id: string): Promise<Author> {
    return this.authorService.deleteAuthor({ id });
  }
}
