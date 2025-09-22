import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/users/user.module';
import { ConfigModule } from '@nestjs/config';
import { AuthorModule } from './modules/author/author.module';
import { StudentsModule } from './modules/students/students.module';
import { InstitutionsModule } from './modules/institutions/institutions.module';
import { CourseModule } from './modules/course/course.module';
import { TeachersModule } from './modules/teachers/teachers.module';
import { BooksModule } from './modules/books/books.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { AuthModule } from './modules/auth/auth.module';
import { SharedAuthModule } from './shared/auth/shared-auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '../.env',
      isGlobal: true,
    }),
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
