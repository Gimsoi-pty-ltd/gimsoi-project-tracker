-- The preceding initial-setup migration already adds the TaskStatus values,
-- sprint dates, task due/blocking fields, and ProjectAnalytics table. This
-- follow-up migration contains only the fields that were still missing.
ALTER TABLE "Task"
ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "labels" TEXT[] DEFAULT ARRAY[]::TEXT[];
