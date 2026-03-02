import prisma from "../lib/prisma.js";
export const createProject = async ({ name, clientId, status, createdByUserId }) => {
  return prisma.project.create({
    data: {
      name,
      clientId: String(clientId),
      status,
      createdByUserId,
    },
  });
};

export const getProjects = async () => {
  return prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: { client: true }, // remove if no relation exists yet
  });
};

export const getProjectById = async (id) => {
  return prisma.project.findUnique({
    where: { id: String(id) },
    include: { client: true }, // remove if no relation exists yet
  });
};

export const updateProject = async (id, data) => {
  return prisma.project.update({
    where: { id: String(id) },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.status !== undefined ? { status: data.status } : {}),
    },
  });
};
