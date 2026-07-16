import { calculateProjectHealth } from "../utils/projectHealth.util.js";

const UNKNOWN_STATUS = "UNKNOWN";

export function transformZohoProject(project = {}) {
  const percentComplete = getNumberValue(
    project.percentComplete,
    project.completion_percent,
    project.percentageComplete,
    project.percentage_complete,
    0
  );

  const openTasks = getNumberValue(
    project.openTasks,
    project.open_tasks,
    0
  );

  const closedTasks = getNumberValue(
    project.closedTasks,
    project.closed_tasks,
    0
  );

  const openIssues = getNumberValue(
    project.openIssues,
    project.open_issues,
    0
  );

  const plannedEndDate = getValue(
    project.endDate,
    project.plannedEndDate,
    project.planned_end_date,
    project.end_date,
    null
  );

  const health = calculateProjectHealth({
    percentComplete,
    plannedEndDate,
    openTasks,
    closedTasks,
  });

  return {
    externalProjectId: getValue(project.id, project.project_id, project.projectId, null),
    name: getValue(project.name, project.project_name, project.projectName, "Untitled Project"),
    owner: getValue(project.owner, project.owner_name, project.ownerName, null),
    status: normalizeProjectStatus(
      getValue(project.status, project.project_status, project.projectStatus, null)
    ),
    percentComplete,
    openTasks,
    closedTasks,
    openIssues,
    plannedEndDate,
    healthScore: health.score,
    healthStatus: health.status,
    taskCompletionRate: health.taskCompletionRate,
    isOverdue: health.isOverdue,
  };
}

export function transformZohoProjects(projects = []) {
  if (!Array.isArray(projects)) {
    return [];
  }

  return projects.map(transformZohoProject);
}

export function normalizeProjectStatus(status) {
  if (typeof status !== "string" || !status.trim()) {
    return UNKNOWN_STATUS;
  }

  const normalized = status.toUpperCase().trim();

  const statusMap = {
    ACTIVE: "ACTIVE",
    COMPLETED: "COMPLETED",
    CLOSED: "COMPLETED",
    IN_PROGRESS: "ACTIVE",
    DRAFT: "DRAFT",
  };

  return statusMap[normalized] || UNKNOWN_STATUS;
}

function getValue(...values) {
  return values.find((value) => value !== undefined && value !== null) ?? null;
}

function getNumberValue(...values) {
  const value = getValue(...values);

  if (value === null) {
    return 0;
  }

  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : 0;
}