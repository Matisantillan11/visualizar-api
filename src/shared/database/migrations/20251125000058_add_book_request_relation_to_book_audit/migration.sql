-- AddForeignKey
ALTER TABLE "public"."BookAudit" ADD CONSTRAINT "BookAudit_bookRequestId_fkey" FOREIGN KEY ("bookRequestId") REFERENCES "public"."BookRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
