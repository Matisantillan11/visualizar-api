import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../users/user.module';
import { SupabaseService } from '../../shared/providers/supabase.service';

@Module({
  imports: [UserModule, ConfigModule],
  controllers: [AuthController],
  providers: [AuthService, SupabaseService],
  exports: [AuthService, SupabaseService],
})
export class AuthModule {}
