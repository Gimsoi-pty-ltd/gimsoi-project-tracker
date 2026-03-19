-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "blockedReason" TEXT,
ADD COLUMN     "dueDate" TIMESTAMP(3),
ADD COLUMN     "isBlocked" BOOLEAN NOT NULL DEFAULT false;
