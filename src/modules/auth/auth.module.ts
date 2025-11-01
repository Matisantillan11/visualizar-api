import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'src/shared/database/prisma/prisma.module';
import { SupabaseService } from '../../shared/providers/supabase.service';
import { StudentsModule } from '../students/students.module';
import { StudentsService } from '../students/students.service';
import { TeachersModule } from '../teachers/teachers.module';
import { TeachersService } from '../teachers/teachers.service';
import { UserModule } from '../users/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    UserModule,
    TeachersModule,
    StudentsModule,
    PrismaModule,
    ConfigModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, SupabaseService, TeachersService, StudentsService],
  exports: [AuthService, SupabaseService, TeachersService, StudentsService],
})
export class AuthModule {}
