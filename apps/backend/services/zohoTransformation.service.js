import { calculateProjectHealth } from "../utils/projectHealth.util.js";

export function transformZohoProject(project) {
  const health = calculateProjectHealth({
    percentComplete: project.percentComplete,
    plannedEndDate: project.endDate,
    openTasks: project.openTasks,
    closedTasks: project.closedTasks,
  });

  return {
    externalProjectId: project.id,
    name: project.name,
    owner: project.owner,
    status: normalizeProjectStatus(project.status),
    percentComplete: Number(project.percentComplete || 0),
    openTasks: Number(project.openTasks || 0),
    closedTasks: Number(project.closedTasks || 0),
    openIssues: Number(project.openIssues || 0),
    plannedEndDate: project.endDate || null,
    healthScore: health.score,
    healthStatus: health.status,
    taskCompletionRate: health.taskCompletionRate,
    isOverdue: health.isOverdue,
  };
}

export function transformZohoProjects(projects = []) {
  return projects.map(transformZohoProject);
}

function normalizeProjectStatus(status = "") {
  const normalized = status.toUpperCase().trim();

  const statusMap = {
    ACTIVE: "ACTIVE",
    COMPLETED: "COMPLETED",
    CLOSED: "COMPLETED",
    IN_PROGRESS: "ACTIVE",
    DRAFT: "DRAFT",
  };

  return statusMap[normalized] || "UNKNOWN";
}