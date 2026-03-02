import prisma from "../lib/prisma.js";

export const createClient = async ({ name, contactEmail, createdByUserId }) => {
  // Adjust model name if your schema uses a different one
  return prisma.client.create({
    data: {
      name,
      contactEmail,
      createdByUserId,
    },
  });
};

export const getClients = async () => {
  return prisma.client.findMany({
    orderBy: { createdAt: "desc" },
  });
};

export const getClientById = async (id) => {
  return prisma.client.findUnique({
    where: { id: String(id) },
  });
};
