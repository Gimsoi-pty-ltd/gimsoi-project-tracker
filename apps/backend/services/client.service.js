import prisma from "../lib/prisma.js";
import { NotFoundError } from "../utils/errors.js";
import { parsePagination } from "../utils/pagination.js";
import { handleConcurrencyError } from "../utils/prismaErrors.js";

export const createClient = async ({ name, contactEmail, createdByUserId }) => {
  return prisma.client.create({
    data: {
      name,
      contactEmail,
      createdByUserId,
    },
  });
};

export const getClients = async (query = {}) => {
  const { limit, cursor } = parsePagination(query);
  return prisma.client.findMany({
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
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

export const updateClient = async (id, data) => {
  const { version, ...updatePayload } = data;
  
  try {
    const client = await prisma.client.update({
      where: { 
        id: String(id),
        version // Optimistic locking
      },
      data: {
        ...updatePayload,
        version: { increment: 1 }
      },
    });
    return client;
  } catch (err) {
    handleConcurrencyError(err, 'Client');
    throw err;
  }
};

export const deleteClient = async (id) => {
  // Global Soft Delete extension handles this
  return prisma.client.delete({
    where: { id: String(id) },
  });
};
