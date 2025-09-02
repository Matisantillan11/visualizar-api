import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/users/user.module';
import { ConfigModule } from '@nestjs/config';
import { AuthorModule } from './modules/author/author.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ',,/.env',
    }),
    AuthorModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
