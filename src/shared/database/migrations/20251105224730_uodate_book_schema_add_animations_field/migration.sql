/*
  Warnings:

  - You are about to drop the column `animationFolderName` on the `Book` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Book" DROP COLUMN "animationFolderName",
ADD COLUMN     "animaitons" TEXT[];
