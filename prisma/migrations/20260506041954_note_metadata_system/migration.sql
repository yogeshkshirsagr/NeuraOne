/*
  Warnings:

  - Added the required column `updatedAt` to the `Note` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Chat_userId_idx";

-- DropIndex
DROP INDEX "Chat_workspaceId_idx";

-- DropIndex
DROP INDEX "Memory_userId_idx";

-- DropIndex
DROP INDEX "Memory_workspaceId_idx";

-- DropIndex
DROP INDEX "WorkspaceMember_workspaceId_idx";

-- AlterTable
ALTER TABLE "Note" ADD COLUMN     "aiSummary" TEXT,
ADD COLUMN     "embeddingReady" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPinned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "linked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "summary" TEXT,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'note',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "Note_type_idx" ON "Note"("type");

-- CreateIndex
CREATE INDEX "Note_isPinned_idx" ON "Note"("isPinned");
