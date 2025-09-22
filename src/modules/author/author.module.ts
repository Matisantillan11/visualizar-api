import { Module } from '@nestjs/common';
import { AuthorController } from './author.controller';
import { AuthorService } from './author.service';
import { PrismaModule } from 'src/shared/database/prisma/prisma.module';
import { UsersService } from '../users/user.service';

@Module({
  imports: [PrismaModule],
  controllers: [AuthorController],
  providers: [AuthorService, UsersService],
})
export class AuthorModule {}
