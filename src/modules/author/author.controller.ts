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
import { Author, Prisma, Role } from '@prisma/client';
import { AuthorService } from './author.service';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('/api/authors')
@ApiTags('Authors')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuthorController {
  constructor(private readonly authorService: AuthorService) {}

  @Get('/')
  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT)
  @ApiOperation({ summary: 'Get all authors' })
  @ApiResponse({ status: 200, description: 'Get all authors' })
  getAuthors(): Promise<Author[]> {
    return this.authorService.getAuthors();
  }

  @Get('/:id')
  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT)
  @ApiOperation({ summary: 'Get an author by id' })
  @ApiResponse({ status: 200, description: 'Get an author by id' })
  getAuthor(@Param('id') id: string): Promise<Author | null> {
    return this.authorService.getAuthor({ id });
  }

  @Post('/')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Create an author' })
  @ApiResponse({ status: 201, description: 'Create an author' })
  createAuthor(@Body() author: Prisma.AuthorCreateInput): Promise<Author> {
    return this.authorService.createAuthor(author);
  }

  @Put('/:id')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Update an author' })
  @ApiResponse({ status: 200, description: 'Update an author' })
  updateAuthor(
    @Param('id') id: string,
    @Body() author: Prisma.AuthorUpdateInput,
  ): Promise<Author> {
    return this.authorService.updateAuthor({ where: { id }, data: author });
  }

  @Delete('/:id')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Delete an author' })
  @ApiResponse({ status: 200, description: 'Delete an author' })
  deleteAuthor(@Param('id') id: string): Promise<Author> {
    return this.authorService.deleteAuthor({ id });
  }
}
