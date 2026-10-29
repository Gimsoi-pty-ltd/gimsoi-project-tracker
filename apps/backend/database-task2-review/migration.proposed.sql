-- CreateIndex
CREATE INDEX "Project_status_idx" ON "Project"("status");

-- CreateIndex
CREATE INDEX "Sprint_status_idx" ON "Sprint"("status");

-- CreateIndex
CREATE INDEX "Task_projectId_status_idx" ON "Task"("projectId", "status");

-- CreateIndex
CREATE INDEX "Task_projectId_dueDate_idx" ON "Task"("projectId", "dueDate");

-- CreateIndex
CREATE INDEX "Task_projectId_isBlocked_idx" ON "Task"("projectId", "isBlocked");
