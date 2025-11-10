/*
  Warnings:

  - The `animations` column on the `Book` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."Book" DROP COLUMN "animations",
ADD COLUMN     "animations" JSONB[] DEFAULT ARRAY[]::JSONB[];
