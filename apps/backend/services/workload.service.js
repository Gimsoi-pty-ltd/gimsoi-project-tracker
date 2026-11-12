
import prisma from "../lib/prisma.js";

const ACTIVE_STATUSES = [
  "TODO",
  "IN_PROGRESS",
  "REVIEW",
  "BLOCKED",
];

const PRIORITY_ORDER = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

const TIME_ZONE = "Africa/Johannesburg";

// Convert a date to YYYY-MM-DD in South African time.
const getLocalDate = (date) => {
  if (!date) return null;

  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(date));

  const values = Object.fromEntries(
    parts.map(({ type, value }) => [type, value])
  );

  return `${values.year}-${values.month}-${values.day}`;
};

// Sort tasks by priority, highest first.
const sortByPriority = (a, b) => {
  const aPriority = PRIORITY_ORDER[a.priority] ?? 99;
  const bPriority = PRIORITY_ORDER[b.priority] ?? 99;

  if (aPriority !== bPriority) {
    return aPriority - bPriority;
  }

  const aDue = a.dueDate
    ? new Date(a.dueDate).getTime()
    : Infinity;

  const bDue = b.dueDate
    ? new Date(b.dueDate).getTime()
    : Infinity;

  return aDue - bDue;
};

// Sort upcoming tasks by nearest deadline.
const sortByUpcomingDate = (a, b) => {
  const aDue = a.dueDate
    ? new Date(a.dueDate).getTime()
    : Infinity;

  const bDue = b.dueDate
    ? new Date(b.dueDate).getTime()
    : Infinity;

  if (aDue !== bDue) {
    return aDue - bDue;
  }

  return sortByPriority(a, b);
};

export const getMyWorkload = async (userId) => {
  // STEP 1: Find the logged-in employee.
  const employee = await prisma.user.findFirst({
    where: {
      id: userId,
      isDeleted: false,
      role: {
        in: ["ADMIN", "PM", "INTERN"],
      },
    },
    select: {
      id: true,
      fullName: true,
      jobTitle: true,
      role: true,
    },
  });

  if (!employee) {
    return null;
  }

  // STEP 2: Get assigned tasks from active projects.
  const tasks = await prisma.task.findMany({
    where: {
      assigneeId: userId,
      isDeleted: false,
      project: {
        isDeleted: false,
      },
    },
    select: {
      id: true,
      title: true,
      status: true,
      priority: true,
      storyPoints: true,
      dueDate: true,
      isBlocked: true,
      projectId: true,
    },
  });

  const now = new Date();
  const today = getLocalDate(now);

  // STEP 3: Calculate overall workload statistics.
  const activeTasks = tasks.filter((task) =>
    ACTIVE_STATUSES.includes(task.status)
  );

  const completedTasks = tasks.filter(
    (task) => task.status === "DONE"
  );

  const overdueTasks = activeTasks.filter(
    (task) =>
      task.dueDate &&
      new Date(task.dueDate).getTime() < now.getTime()
  );

  const blockedTasks = activeTasks.filter(
    (task) =>
      task.status === "BLOCKED" || task.isBlocked
  );

  const activeStoryPoints = activeTasks.reduce(
    (total, task) => total + (task.storyPoints ?? 0),
    0
  );

  // STEP 4: Find tasks due today.
  // Include all statuses, including DONE.
  const todayTasks = tasks.filter(
    (task) => getLocalDate(task.dueDate) === today
  );

  // STEP 5: Find fallback tasks.
  // Only use these when nothing is due today.
  const fallbackTasks = tasks.filter((task) => {
    if (task.status === "DONE") {
      return false;
    }

    const isInProgress = task.status === "IN_PROGRESS";

    const isUpcoming =
      task.dueDate &&
      getLocalDate(task.dueDate) > today;

    return isInProgress || isUpcoming;
  });

  // STEP 6: Choose which tasks to display.
  const hasTasksDueToday = todayTasks.length > 0;

  const selectedTasks = hasTasksDueToday
    ? todayTasks.sort(sortByPriority)
    : fallbackTasks.sort(sortByUpcomingDate);

  // Show a maximum of 5 tasks on the card.
  const focusTasks = selectedTasks.slice(0, 5);

  // STEP 7: Tell frontend which card heading to use.
  let focusMode = "EMPTY";

  if (focusTasks.length > 0) {
    focusMode = hasTasksDueToday
      ? "DUE_TODAY"
      : "UP_NEXT";
  }

  // STEP 8: Return the complete workload response.
  return {
    employee,

    workload: {
      activeTasks: activeTasks.length,
      completedTasks: completedTasks.length,
      overdueTasks: overdueTasks.length,
      blockedTasks: blockedTasks.length,
      activeStoryPoints,
    },

    focusMode,
    focusTasks,
  };
};
