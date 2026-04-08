import prisma from "../lib/prisma.js";
import { NotFoundError } from "../utils/errors.js";

export const createClient = async ({ name, contactEmail, createdByUserId }) => {
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
  const client = await prisma.client.findUnique({
    where: { id: String(id) },
  });
  if (!client) {
    throw new NotFoundError("Client not found");
  }
  return client;
};
