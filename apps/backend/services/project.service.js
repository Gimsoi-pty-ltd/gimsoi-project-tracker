import prisma from "../lib/prisma.js";
import { StateTransitionError, NotFoundError } from "../utils/errors.js";
import { assertOwnership } from "../utils/ownership.js";

export const createProject = async ({ name, clientId, status, createdByUserId }) => {
  return prisma.project.create({
    data: {
      name,
      clientId: String(clientId),
      status: status || "DRAFT",
      createdByUserId,
    },
  });
};

export const getProjects = async () => {
  return prisma.project.findMany({
    orderBy: { createdAt: "desc" },
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
