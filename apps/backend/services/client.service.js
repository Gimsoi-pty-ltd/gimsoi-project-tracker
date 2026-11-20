import prisma from "../lib/prisma.js";
import { NotFoundError, ConflictError } from "../utils/errors.js";
import { parsePagination } from "../utils/pagination.js";

export const createClient = async ({ name, contactEmail, createdByUserId }) => {
  return prisma.client.create({
    data: {
      name,
      contactEmail,
      createdByUserId,
    },
  });
};

export const getClients = async (query = {}, contactEmail = null) => {
  const { limit, cursor } = parsePagination(query);

  return prisma.client.findMany({
    where: contactEmail
      ? {
          contactEmail: {
            equals: contactEmail,
            mode: "insensitive",
          },
        }
      : {},
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    orderBy: { createdAt: "desc" },
  });
};

export const getClientById = async (id, contactEmail = null) => {
  const client = await prisma.client.findFirst({
    where: {
      id: String(id),
      ...(contactEmail
        ? {
            contactEmail: {
              equals: contactEmail,
              mode: "insensitive",
            },
          }
        : {}),
    },
  });

  if (!client) {
    if (contactEmail) return null;
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
    if (err.code === 'P2025') {
      throw new ConflictError("Client was modified by another user. Please refresh and try again.");
    }
    throw err;
  }
};

export const deleteClient = async (id) => {
  // Global Soft Delete extension handles this
  return prisma.client.delete({
    where: { id: String(id) },
  });
};
