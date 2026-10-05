/** @see {@link docs/DATA_CONTRACT.md} */
import prisma from "../lib/prisma.js";
import { StateTransitionError, NotFoundError, ConflictError } from "../utils/errors.js";
import { assertOwnership } from "../utils/ownership.js";
// Cross-domain dependency: Project domain requires task summary data. Access only via the narrow summary function — do not import broad task service internals.
import { getProjectTaskSummary, getProjectTaskSummaryBatch } from "./task.service.js";
import { PROJECT_STATUS } from "../constants/statuses.js";
import ROLES from "../constants/roles.js";

export const createProject = async ({ name, clientId, status, description, startDate, endDate, milestones, setupNotes, createdByUserId }) => {
  if (status && ![PROJECT_STATUS.DRAFT, PROJECT_STATUS.ACTIVE, PROJECT_STATUS.COMPLETED, PROJECT_STATUS.ARCHIVED].includes(status)) {
    throw new StateTransitionError(`Invalid project status '${status}'.`);
  }

  return prisma.$transaction(async (tx) => {
    const project = await tx.project.create({
      data: {
        name,
        clientId: String(clientId),
        status: status || PROJECT_STATUS.DRAFT,
        description,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        milestones: milestones || null,
        setupNotes: setupNotes || null,
        createdByUserId,
      },
    });

    if (createdByUserId) {
      await tx.projectMember.create({
        data: {
          projectId: project.id,
          userId: createdByUserId,
          role: 'OWNER'
        }
      });
    }

    return project;
  });
};

/**
 * @param {{ limit?: number, cursor?: string }} options
 * limit defaults to 50, max 100. cursor is the id of the last record from the previous page.
 */
export const getProjects = async ({ limit = 50, cursor, search, status, createdByUserId, includeArchived, requestingUser } = {}) => {
  const take = Math.min(Number(limit) || 50, 100);

  const where = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } }
    ];
  }
  if (status) {
    where.status = status;
  } else if (includeArchived !== 'true' && includeArchived !== true) {
    // Exclude archived by default if no explicit status is requested
    where.status = { not: PROJECT_STATUS.ARCHIVED };
  }
  if (createdByUserId) {
    where.createdByUserId = createdByUserId;
  }

  // Row-level security: non-admins only see projects they are members of
  if (requestingUser && ![ROLES.ADMIN, ROLES.PROJECT_MANAGER].includes(requestingUser.role)) {
    where.members = {
      some: {
        userId: requestingUser.id
      }
    };
  }

  const projects = await prisma.project.findMany({
    take: take + 1,         // fetch one extra to detect whether there's a next page
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    where,
    orderBy: { createdAt: 'desc' },
    include: { client: true,
      sprints: {
        orderBy: { startDate: 'asc' },
        include: { tasks: { select: { id: true } } },
      },
      members:{
       include: { user: { select: { id: true, fullName: true } } },
     },
    },
  });
  return projects.map(attachTeam);
};

const ROLE_LABEL = { OWNER: "Owner", MEMBER: "Member", VIEWER: "Viewer" };
const attachTeam = (project) => ({
  ...project,
  team: (project.members || []).map(
    (j) => `${j.user.fullName} (${ROLE_LABEL[j.role] || j.role})`
  ),
});

export const getProjectById = async (id) => {
  const project = await prisma.project.findUnique({
    where: { id: String(id) },
    include: { client: true,
      sprints: { 
        orderBy: { startDate: 'asc' },
        include: { tasks: { select: { id: true } } },
      },
      members: {
        include: { user: { select: { id: true, fullName: true } } },
      }
     },
  });
  if (!project) return project;
  return attachTeam(project);
};

export const updateProject = async (id, data, userId, userRole) => {
  const existing = await prisma.project.findUnique({ where: { id: String(id) } });
  if (!existing) throw new NotFoundError(`Project ${id} not found`);

  assertOwnership(existing, userId, userRole);

  if (data.status && existing.status !== data.status) {
    const validTransitions = {
      [PROJECT_STATUS.DRAFT]: [PROJECT_STATUS.ACTIVE, PROJECT_STATUS.COMPLETED],
      [PROJECT_STATUS.ACTIVE]: [PROJECT_STATUS.COMPLETED, PROJECT_STATUS.DRAFT, PROJECT_STATUS.ARCHIVED],
      [PROJECT_STATUS.COMPLETED]: [PROJECT_STATUS.ARCHIVED],
      [PROJECT_STATUS.ARCHIVED]: [PROJECT_STATUS.ACTIVE]
    };

    const allowed = validTransitions[existing.status] || [];
    if (!allowed.includes(data.status)) {
      throw new StateTransitionError(`Illegal project state transition from ${existing.status} to ${data.status}`);
    }
  }

  try {
    return await prisma.project.update({
      where: { id: String(id), version: data.version },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.status && { status: data.status }),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.startDate !== undefined ? { startDate: data.startDate ? new Date(data.startDate) : null } : {}),
        ...(data.endDate !== undefined ? { endDate: data.endDate ? new Date(data.endDate) : null } : {}),
        ...(data.milestones !== undefined ? { milestones: data.milestones || null } : {}),
        ...(data.setupNotes !== undefined ? { setupNotes: data.setupNotes || null } : {}),
        version: { increment: 1 }
      },
    });
  } catch (err) {
    if (err.code === 'P2025') {
      throw new ConflictError("Project was modified by another user. Please refresh and try again.");
    }
    throw err;
  }
};

/**
 * Returns task completion counts for a project in a single aggregation query.
 *
 * @param {string} projectId
 * @returns {{ TODO: number, IN_PROGRESS: number, DONE: number, total: number, percentComplete: number }}
 */
export const getProjectProgress = async (projectId, userRole) => {
  const summary = await getProjectTaskSummary(projectId);

  // CLIENT role receives percentComplete only. Full task breakdown is restricted to internal roles. See docs/DATA_CONTRACT.md.
  if (userRole === ROLES.CLIENT) {
    return { percentComplete: summary.percentComplete };
  }

  return summary;
};

export const getBatchProjectProgress = async (projectIds, userRole) => {
  if (!projectIds || projectIds.length === 0) return {};

  const summaries = await getProjectTaskSummaryBatch(projectIds);
  const results = {};

  for (const projectId of projectIds) {
    const summary = summaries[projectId];
    if (userRole === ROLES.CLIENT) {
      results[projectId] = { percentComplete: summary ? summary.percentComplete : 0 };
    } else {
      results[projectId] = summary;
    }
  }

  return results;
};

export const deleteProject = async (id, userId, userRole) => {
  const existing = await prisma.project.findUnique({ where: { id: String(id) } });
  if (!existing) throw new NotFoundError(`Project ${id} not found`);

  assertOwnership(existing, userId, userRole);

  return prisma.project.delete({ where: { id: String(id) } });
};

export const syncProjectAnalytics = async (projectId) => {
  const taskSummary = await getProjectTaskSummary(projectId);

  const totalSprints = await prisma.sprint.count({ where: { projectId: String(projectId) } });
  const activeSprints = await prisma.sprint.count({
    where: {
      projectId: String(projectId),
      status: 'ACTIVE'
    }
  });

  return prisma.projectAnalytics.upsert({
    where: { projectId: String(projectId) },
    create: {
      projectId: String(projectId),
      totalTasks: taskSummary.total,
      completedTasks: taskSummary.DONE,
      blockedTasks: taskSummary.BLOCKED,
      cancelledTasks: taskSummary.CANCELLED,
      totalSprints,
      activeSprints,
      syncStatus: 'synced',
      lastSyncedAt: new Date()
    },
    update: {
      totalTasks: taskSummary.total,
      completedTasks: taskSummary.DONE,
      blockedTasks: taskSummary.BLOCKED,
      cancelledTasks: taskSummary.CANCELLED,
      totalSprints,
      activeSprints,
      syncStatus: 'synced',
      lastSyncedAt: new Date()
    }
  });
};
