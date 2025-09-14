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
import { Prisma, Category, Role } from '@prisma/client';
import { CategoriesService } from './categories.service';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('/api/categories')
@ApiTags('Categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoriesController {
  constructor(private readonly categoryService: CategoriesService) {}

  @Get('/')
  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT)
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({ status: 200, description: 'Get all categories' })
  getCategories(): Promise<Category[]> {
    return this.categoryService.getCategories();
  }

  @Get('/:id')
  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT)
  @ApiOperation({ summary: 'Get an categories by id' })
  @ApiResponse({ status: 200, description: 'Get an categories by id' })
  getCategory(@Param('id') id: string): Promise<Category | null> {
    return this.categoryService.getCategory({ id });
  }

  @Post('/')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Create an categories' })
  @ApiResponse({ status: 201, description: 'Create an categories' })
  createCategory(
    @Body() category: Prisma.CategoryCreateInput,
  ): Promise<Category> {
    return this.categoryService.createCategory(category);
  }

  @Put('/:id')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Update an categories' })
  @ApiResponse({ status: 200, description: 'Update an categories' })
  updateCategory(
    @Param('id') id: string,
    @Body() category: Prisma.CategoryUpdateInput,
  ): Promise<Category> {
    return this.categoryService.updateCategory({
      where: { id },
      data: category,
    });
  }

  @Delete('/:id')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Delete an categories' })
  @ApiResponse({ status: 200, description: 'Delete an categories' })
  deleteCategory(@Param('id') id: string): Promise<Category> {
    return this.categoryService.deleteCategory({ id });
  }
}
