/*
  Warnings:

  - You are about to drop the column `userId` on the `Author` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Author" DROP CONSTRAINT "Author_userId_fkey";

-- DropIndex
DROP INDEX "public"."Author_userId_key";

-- AlterTable
ALTER TABLE "public"."Author" DROP COLUMN "userId";
