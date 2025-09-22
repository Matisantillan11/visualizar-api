import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseService } from '../providers/supabase.service';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { UserModule } from '../../modules/users/user.module';

@Global()
@Module({
  imports: [ConfigModule, UserModule],
  providers: [SupabaseService, JwtAuthGuard],
  exports: [SupabaseService, JwtAuthGuard],
})
export class SharedAuthModule {}
