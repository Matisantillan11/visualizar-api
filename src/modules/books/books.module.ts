import { Module } from '@nestjs/common';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { PrismaModule } from 'src/shared/database/prisma/prisma.module';
import { UsersService } from '../users/user.service';

@Module({
  imports: [PrismaModule],
  controllers: [BooksController],
  providers: [BooksService, UsersService],
})
export class BooksModule {}
