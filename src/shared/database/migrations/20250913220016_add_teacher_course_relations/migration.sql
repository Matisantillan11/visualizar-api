-- AddForeignKey
ALTER TABLE "public"."TeacherCourse" ADD CONSTRAINT "TeacherCourse_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeacherCourse" ADD CONSTRAINT "TeacherCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
