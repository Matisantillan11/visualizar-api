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
import { UsersService } from './user.service';
import { Prisma, type User, Role } from '@prisma/client';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('/api/users')
@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UsersService) {}

  @Get('/')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Get all users' })
  getUsers(): Promise<User[]> {
    return this.userService.getUsers();
  }

  @Get('/:id')
  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT)
  @ApiOperation({ summary: 'Get a user by id' })
  @ApiResponse({ status: 200, description: 'Get a user by id' })
  getUser(@Param('id') id: string): Promise<User | null> {
    return this.userService.getUser({ id });
  }

  @Post('/search')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Get a user by email' })
  @ApiResponse({ status: 200, description: 'Get a user by email' })
  getUserByEmail(@Body('email') email: string): Promise<User | null> {
    return this.userService.getUser({ email });
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a user' })
  @ApiResponse({ status: 201, description: 'Create a user' })
  createUser(@Body() user: Prisma.UserCreateInput): Promise<User> {
    return this.userService.createUser(user);
  }

  @Put('/:id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({ status: 200, description: 'Update a user' })
  updateUser(
    @Param('id') id: string,
    @Body() user: Prisma.UserUpdateInput,
  ): Promise<User> {
    return this.userService.updateUser({ where: { id }, data: user });
  }

  @Delete('/:id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({ status: 200, description: 'Delete a user' })
  deleteUser(@Param('id') id: string): Promise<User> {
    return this.userService.deleteUser({ id });
  }
}
