import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { PrismaModule } from 'src/shared/database/prisma/prisma.module';
import { UsersService } from '../users/user.service';

@Module({
  imports: [PrismaModule],
  controllers: [CategoriesController],
  providers: [CategoriesService, UsersService],
})
export class CategoriesModule {}
