import { Module } from '@nestjs/common';
import { InstitutionsService } from './institutions.service';
import { PrismaModule } from 'src/shared/database/prisma/prisma.module';
import { InstitutionsController } from './institutions.controller';
import { UsersService } from '../users/user.service';

@Module({
  imports: [PrismaModule],
  providers: [InstitutionsService, UsersService],
  controllers: [InstitutionsController],
})
export class InstitutionsModule {}
