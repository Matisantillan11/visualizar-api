import { Module } from '@nestjs/common';
import { UsersService } from './user.service';
import { PrismaService } from 'src/shared/database/prisma/prisma.service';
import { UserController } from './user.controller';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [UsersService, PrismaService],
})
export class UserModule {}
