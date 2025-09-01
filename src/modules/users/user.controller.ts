import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { UsersService } from './user.service';
import { Prisma, type User } from '@prisma/client';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('/api/users')
@ApiTags('Users')
export class UserController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Get all users' })
  getHello(): Promise<User[]> {
    return this.userService.getUsers();
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Get a user by id' })
  @ApiResponse({ status: 200, description: 'Get a user by id' })
  getUser(@Param('id') id: string): Promise<User | null> {
    return this.userService.getUser({ id });
  }

  @Post()
  @ApiOperation({ summary: 'Create a user' })
  @ApiResponse({ status: 201, description: 'Create a user' })
  createUser(@Body() user: Prisma.UserCreateInput): Promise<User> {
    return this.userService.createUser(user);
  }

  @Put('/:id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({ status: 200, description: 'Update a user' })
  updateUser(
    @Param('id') id: string,
    @Body() user: Prisma.UserUpdateInput,
  ): Promise<User> {
    return this.userService.updateUser({ where: { id }, data: user });
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({ status: 200, description: 'Delete a user' })
  deleteUser(@Param('id') id: string): Promise<User> {
    return this.userService.deleteUser({ id });
  }
}
