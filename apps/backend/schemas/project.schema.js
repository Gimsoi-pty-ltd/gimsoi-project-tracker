import { z } from "zod";

export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(3, "Project name must be at least 3 characters long"),
    clientId: z.string().uuid("Invalid clientId format"),
    status: z.enum(["DRAFT", "ACTIVE", "COMPLETED"]).optional().default("DRAFT"),
  }),
});

export const updateProjectSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid project ID format"),
  }),
  body: z.object({
    name: z.string().min(3).optional(),
    status: z.enum(["DRAFT", "ACTIVE", "COMPLETED"]).optional(),
  }).refine((data) => data.name !== undefined || data.status !== undefined, {
    message: "At least one field (name or status) must be provided for update",
  }),
});

export const getProjectSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid project ID format"),
  }),
});
