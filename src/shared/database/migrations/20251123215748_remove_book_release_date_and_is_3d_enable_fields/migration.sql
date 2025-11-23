/*
  Warnings:

  - You are about to drop the column `is3dEnabled` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `releaseDate` on the `Book` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Book" DROP COLUMN "is3dEnabled",
DROP COLUMN "releaseDate";
