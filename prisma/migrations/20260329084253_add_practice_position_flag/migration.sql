/*
  Warnings:

  - A unique constraint covering the columns `[userId,marketId,isPractice]` on the table `Position` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Position_userId_marketId_key";

-- AlterTable
ALTER TABLE "Position" ADD COLUMN     "isPractice" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Position_userId_marketId_isPractice_key" ON "Position"("userId", "marketId", "isPractice");
