import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { AuthorModule } from './modules/author/author.module';
import { BooksModule } from './modules/books/books.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { CourseModule } from './modules/course/course.module';
import { InstitutionsModule } from './modules/institutions/institutions.module';
import { StudentsModule } from './modules/students/students.module';
import { TeachersModule } from './modules/teachers/teachers.module';
import { UserModule } from './modules/users/user.module';
import { SharedAuthModule } from './shared/auth/shared-auth.module';
import { EmailModule } from './shared/providers/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '../.env',
      isGlobal: true,
    }),
    EmailModule,
    SharedAuthModule,
    AuthModule,
    AuthorModule,
    BooksModule,
    CategoriesModule,
    CourseModule,
    InstitutionsModule,
    StudentsModule,
    TeachersModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
