import {
  PROJECT_HEALTH_STATUS,
  PROJECT_HEALTH_THRESHOLDS,
} from "../constants/projectHealth.constants.js";

export function calculateProjectHealth({
  percentComplete = 0,
  plannedEndDate,
  openTasks = 0,
  closedTasks = 0,
}) {
  const today = new Date();
  const endDate = plannedEndDate ? new Date(plannedEndDate) : null;

  const totalTasks = Number(openTasks) + Number(closedTasks);
  const taskCompletionRate =
    totalTasks > 0 ? (Number(closedTasks) / totalTasks) * 100 : percentComplete;

  let score = Math.round((Number(percentComplete) + taskCompletionRate) / 2);

  if (endDate && today > endDate && percentComplete < 100) {
    score -= 25;
  }

  score = Math.max(0, Math.min(100, score));

  return {
    score,
    status: getProjectHealthStatus(score),
    taskCompletionRate: Math.round(taskCompletionRate),
    isOverdue: Boolean(endDate && today > endDate && percentComplete < 100),
  };
}

function getProjectHealthStatus(score) {
  if (score >= PROJECT_HEALTH_THRESHOLDS.HEALTHY_MIN_SCORE) {
    return PROJECT_HEALTH_STATUS.HEALTHY;
  }

  if (score >= PROJECT_HEALTH_THRESHOLDS.AT_RISK_MIN_SCORE) {
    return PROJECT_HEALTH_STATUS.AT_RISK;
  }

  return PROJECT_HEALTH_STATUS.DELAYED;
}
