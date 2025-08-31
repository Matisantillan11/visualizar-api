import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/users/user.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './shared/database/prisma/prisma.service';

@Module({
  imports: [
    UserModule,
    ConfigModule.forRoot({
      envFilePath: ',,/.env',
    }),
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
