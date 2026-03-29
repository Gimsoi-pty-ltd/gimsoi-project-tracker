import prisma from "../lib/prisma.js";
import { StateTransitionError, NotFoundError } from "../utils/errors.js";
import { assertOwnership } from "../utils/ownership.js";
import { getTaskCompletionStats } from "./task.service.js";

export const createProject = async ({ name, clientId, status, createdByUserId }) => {
  if (status && !['DRAFT', 'ACTIVE', 'COMPLETED'].includes(status)) {
    throw new StateTransitionError(`Invalid project status '${status}'. Allowed: DRAFT, ACTIVE, COMPLETED`);
  }
  return prisma.project.create({
    data: {
      name,
      clientId: String(clientId),
      status: status || "DRAFT",
      createdByUserId,
    },
  });
};

/**
 * @param {{ limit?: number, cursor?: string }} options
 * limit defaults to 50, max 100. cursor is the id of the last record from the previous page.
 */
export const getProjects = async ({ limit = 50, cursor } = {}) => {
  const take = Math.min(Number(limit) || 50, 100);
  return prisma.project.findMany({
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

  return getTaskCompletionStats(projectId);
};
