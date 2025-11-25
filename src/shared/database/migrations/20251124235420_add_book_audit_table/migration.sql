-- CreateEnum
CREATE TYPE "public"."BookAuditAction" AS ENUM ('CREATED', 'UPDATED');

-- CreateTable
CREATE TABLE "public"."BookAudit" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "animations" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "courseIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "userId" TEXT NOT NULL,
    "bookId" TEXT,
    "bookRequestId" TEXT,
    "action" "public"."BookAuditAction" NOT NULL,

    CONSTRAINT "BookAudit_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."BookAudit" ADD CONSTRAINT "BookAudit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BookAudit" ADD CONSTRAINT "BookAudit_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "public"."Book"("id") ON DELETE SET NULL ON UPDATE CASCADE;
