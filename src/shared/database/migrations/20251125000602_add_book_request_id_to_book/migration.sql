-- AlterTable
ALTER TABLE "public"."Book" ADD COLUMN     "bookRequestId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."Book" ADD CONSTRAINT "Book_bookRequestId_fkey" FOREIGN KEY ("bookRequestId") REFERENCES "public"."BookRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
