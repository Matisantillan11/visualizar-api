-- CreateEnum
CREATE TYPE "public"."BookRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'DENIED', 'PUBLISHED');

-- AlterTable
ALTER TABLE "public"."BookRequest" ADD COLUMN     "status" "public"."BookRequestStatus" NOT NULL DEFAULT 'PENDING';
