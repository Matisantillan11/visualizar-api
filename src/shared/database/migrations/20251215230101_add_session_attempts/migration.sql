-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "retryAt" TIMESTAMP(3);
