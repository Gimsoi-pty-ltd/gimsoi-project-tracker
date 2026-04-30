export function mapZohoProject(project) {
  return {
    externalId: project.id_string || project.id,
    name: project.name,
    status: normalizeProjectStatus(project.status),
    percentComplete: project.percent_complete || project.completed_percent || null,
    owner: project.owner_name || project.owner || null,
    createdAt: project.created_date || null,
    updatedAt: project.updated_date || null,
    source: "ZOHO",
  };
}

export function mapZohoTask(task, projectId) {
  return {
    externalId: task.id_string || task.id,
    projectId,
    name: task.name,
    status: normalizeTaskStatus(task.status?.name || task.status),
    priority: normalizePriority(task.priority),
    owner: task.owner_name || task.owner || null,
    startDate: task.start_date || null,
    dueDate: task.end_date || task.due_date || null,
    duration: task.duration || null,
    percentComplete: task.percent_complete || null,
    source: "ZOHO",
  };
}

function normalizeProjectStatus(status) {
  const value = String(status || "").toUpperCase();

  if (value.includes("ACTIVE")) return "ACTIVE";
  if (value.includes("COMPLETE")) return "COMPLETED";

  return "DRAFT";
}

function normalizeTaskStatus(status) {
  const value = String(status || "").toUpperCase();

  if (value.includes("OPEN") || value.includes("TODO")) return "TODO";
  if (value.includes("PROGRESS")) return "IN_PROGRESS";
  if (value.includes("CLOSED") || value.includes("DONE") || value.includes("COMPLETE")) return "DONE";

  return "TODO";
}

function normalizePriority(priority) {
  const value = String(priority || "").toUpperCase();

  if (["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(value)) {
    return value;
  }

  return "MEDIUM";
}
