/*
  Warnings:

  - You are about to drop the column `userId` on the `Job` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Job_userId_idx";

-- DropIndex
DROP INDEX "Job_userId_url_key";

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "userId",
ADD COLUMN     "createdBy" TEXT;

-- CreateIndex
CREATE INDEX "Job_url_idx" ON "Job"("url");
