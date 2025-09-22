import { Module } from '@nestjs/common';
import { TeachersController } from './teachers.controller';
import { TeachersService } from './teachers.service';
import { PrismaModule } from 'src/shared/database/prisma/prisma.module';
import { UsersService } from '../users/user.service';

@Module({
  imports: [PrismaModule],
  controllers: [TeachersController],
  providers: [TeachersService, UsersService],
})
export class TeachersModule {}
