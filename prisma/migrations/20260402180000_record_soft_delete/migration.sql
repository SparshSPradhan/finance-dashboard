-- AlterTable
ALTER TABLE "Record" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Record_deletedAt_idx" ON "Record"("deletedAt");
