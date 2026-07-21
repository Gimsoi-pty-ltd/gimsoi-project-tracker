-- Project scheduling and setup metadata.
ALTER TABLE "Project"
ADD COLUMN "startDate" TIMESTAMP(3),
ADD COLUMN "milestones" TEXT,
ADD COLUMN "setupNotes" TEXT;

-- Task hierarchy and lightweight ownership/team identifiers.
ALTER TABLE "Task"
ADD COLUMN "parentTaskId" TEXT,
ADD COLUMN "ownerIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "teamIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

CREATE INDEX "Task_parentTaskId_idx" ON "Task"("parentTaskId");

ALTER TABLE "Task"
ADD CONSTRAINT "Task_parentTaskId_fkey"
FOREIGN KEY ("parentTaskId") REFERENCES "Task"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
