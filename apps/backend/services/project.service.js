import prisma from "../lib/prisma.js";
import { StateTransitionError, NotFoundError } from "../utils/errors.js";
import { assertOwnership } from "../utils/ownership.js";

export const createProject = async ({ name, clientId, status, createdByUserId, description, endDate }) => {
  return prisma.project.create({
    data: {
      name,
      clientId: String(clientId),
      status: status || "DRAFT",
      createdByUserId,
      description,
      endDate: endDate ? new Date(endDate) : null,
    },
  });
};

/**
 * @param {{ limit?: number, cursor?: string, search?: string }} options
 * limit defaults to 50, max 100. cursor is the id of the last record from the previous page.
 */
export const getProjects = async ({ limit = 50, cursor, search } = {}) => {
  const take = Math.min(Number(limit) || 50, 100);
  const where = search ? {
    OR: [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } }
    ]
  } : {};

  return prisma.project.findMany({
    where,
    take: take + 1,         // fetch one extra to detect whether there's a next page
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
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

  if (data.status) {
    if (existing.status !== data.status) {
      const validTransitions = {
        'DRAFT': ['ACTIVE', 'COMPLETED'],
        'ACTIVE': ['COMPLETED', 'DRAFT'],
        // POLICY-PENDING: team must decide if a COMPLETED project can revert to ACTIVE.
        // Currently permitted. Remove 'ACTIVE' here to permanently block regression.
        'COMPLETED': ['ACTIVE']
      };

      const allowed = validTransitions[existing.status] || [];
      if (!allowed.includes(data.status)) {
        throw new StateTransitionError(`Illegal project state transition from ${existing.status} to ${data.status}`);
      }
    }
  }

  return prisma.project.update({
    where: { id: String(id) },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.status !== undefined ? { status: data.status } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.endDate !== undefined ? { endDate: data.endDate ? new Date(data.endDate) : null } : {}),
    },
  });
};

/**
 * Returns task completion counts for a project in a single aggregation query.
 * POLICY-PENDING: whether CLIENT role should receive full breakdown vs percentComplete only.
 *
 * @param {string} projectId
 * @returns {{ TODO: number, IN_PROGRESS: number, DONE: number, total: number, percentComplete: number }}
 */
export const getProjectProgress = async (projectId) => {
  const project = await prisma.project.findUnique({ where: { id: String(projectId) } });
  if (!project) return null;

  const groups = await prisma.task.groupBy({
    by: ['status'],
    where: { projectId: String(projectId) },
    _count: { status: true },
  });

  const totals = { TODO: 0, IN_PROGRESS: 0, DONE: 0 };
  for (const g of groups) {
    if (g.status in totals) totals[g.status] = g._count.status;
  }

  const total = totals.TODO + totals.IN_PROGRESS + totals.DONE;
  return {
    ...totals,
    total,
    percentComplete: total ? Math.round((totals.DONE / total) * 100) : 0,
  };
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

export const deleteProject = async (id, userId, userRole) => {
  const existing = await prisma.project.findUnique({ where: { id: String(id) } });
  if (!existing) throw new NotFoundError(`Project ${id} not found`);

  assertOwnership(existing, userId, userRole);

  return prisma.project.delete({
    where: { id: String(id) },
  });
};

