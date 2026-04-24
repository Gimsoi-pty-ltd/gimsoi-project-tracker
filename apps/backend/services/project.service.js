/** @see {@link docs/DATA_CONTRACT.md} */
import prisma from "../lib/prisma.js";
import { StateTransitionError, NotFoundError } from "../utils/errors.js";
import { assertOwnership } from "../utils/ownership.js";
// Cross-domain dependency: Project domain requires task summary data. Access only via the narrow summary function — do not import broad task service internals.
import { getProjectTaskSummary, getProjectTaskSummaryBatch } from "./task.service.js";
import { PROJECT_STATUS } from "../constants/statuses.js";
import ROLES from "../constants/roles.js";

export const createProject = async ({ name, clientId, status, description, createdByUserId }) => {
  if (status && ![PROJECT_STATUS.DRAFT, PROJECT_STATUS.ACTIVE, PROJECT_STATUS.COMPLETED].includes(status)) {
    throw new StateTransitionError(`Invalid project status '${status}'. Allowed: ${PROJECT_STATUS.DRAFT}, ${PROJECT_STATUS.ACTIVE}, ${PROJECT_STATUS.COMPLETED}`);
  }
  return prisma.project.create({
    data: {
      name,
      clientId: String(clientId),
      status: status || PROJECT_STATUS.DRAFT,
      description,
      createdByUserId,
    },
  });
};

/**
 * @param {{ limit?: number, cursor?: string }} options
 * limit defaults to 50, max 100. cursor is the id of the last record from the previous page.
 */
export const getProjects = async ({ limit = 50, cursor, search } = {}) => {
  const take = Math.min(Number(limit) || 50, 100);

  const where = {};
  if (search) {
    where.name = { contains: search, mode: 'insensitive' };
  }

  // KNOWN LIMITATION (tracked: fix/client-project-scoping):
  // CLIENT users should be scoped to projects linked via Project.clientId → Client.
  // That relationship requires a ClientUser join table not yet implemented.
  // Current workaround: CLIENT role sees all projects (same as INTERN).
  // This is intentionally permissive until the ClientUser schema is added.
  // Do NOT scope by createdByUserId — CLIENTs never create projects and would see nothing.
  //
  // When ClientUser table is added, replace this block with:
  //   where.client = { users: { some: { userId: requestingUser.id } } };

  return prisma.project.findMany({
    take: take + 1,         // fetch one extra to detect whether there's a next page
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    where,
    orderBy: { createdAt: 'desc' },
    include: { client: true },
  });
};

export const getProjectById = async (id) => {
  return prisma.project.findUnique({
    where: { id: String(id) },
    include: { client: true },
  });
};

export const updateProject = async (id, data, userId, userRole) => {
  const existing = await prisma.project.findUnique({ where: { id: String(id) } });
  if (!existing) throw new NotFoundError(`Project ${id} not found`);

  assertOwnership(existing, userId, userRole);

  if (data.status && existing.status !== data.status) {
    const validTransitions = {
      [PROJECT_STATUS.DRAFT]: [PROJECT_STATUS.ACTIVE, PROJECT_STATUS.COMPLETED],
      [PROJECT_STATUS.ACTIVE]: [PROJECT_STATUS.COMPLETED, PROJECT_STATUS.DRAFT],
      [PROJECT_STATUS.COMPLETED]: []
    };

    const allowed = validTransitions[existing.status] || [];
    if (!allowed.includes(data.status)) {
      throw new StateTransitionError(`Illegal project state transition from ${existing.status} to ${data.status}`);
    }
  }

  return prisma.project.update({
    where: { id: String(id) },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.status && { status: data.status }),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.endDate !== undefined ? { endDate: data.endDate } : {}),
    },
  });
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
