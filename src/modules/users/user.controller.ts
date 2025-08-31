import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UsersService } from './user.service';
import { Prisma, type User } from '@prisma/client';

@Controller('/api/users')
export class UserController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  getHello(): Promise<User[]> {
    return this.userService.getUsers();
  }

  @Get('/:id')
  getUser(@Param('id') id: string): Promise<User | null> {
    return this.userService.getUser({ id });
  }

  @Post()
  createUser(@Body() user: Prisma.UserCreateInput): Promise<User> {
    return this.userService.createUser(user);
  }
}
