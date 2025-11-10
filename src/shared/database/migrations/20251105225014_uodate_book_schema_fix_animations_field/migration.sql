/*
  Warnings:

  - You are about to drop the column `animaitons` on the `Book` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Book" DROP COLUMN "animaitons",
ADD COLUMN     "animations" TEXT[] DEFAULT ARRAY[]::TEXT[];
