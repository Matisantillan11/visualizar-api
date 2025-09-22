import { Module } from '@nestjs/common';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { PrismaModule } from 'src/shared/database/prisma/prisma.module';
import { UsersService } from '../users/user.service';

@Module({
  imports: [PrismaModule],
  controllers: [StudentsController],
  providers: [StudentsService, UsersService],
})
export class StudentsModule {}
