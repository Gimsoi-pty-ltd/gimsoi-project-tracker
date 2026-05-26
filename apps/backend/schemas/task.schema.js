import { z } from "zod";
import { TASK_STATUS } from "../constants/statuses.js";

const VALID_TASK_STATUSES = /** @type {[string, ...string[]]} */ (Object.values(TASK_STATUS));
export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Task title is required"),
    description: z.string().optional(),
    projectId: z.string().uuid("Invalid projectId format"),
    sprintId: z.string().uuid("Invalid sprintId format").optional(),
    assigneeId: z.string().uuid("Invalid assigneeId format").optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional().default("MEDIUM"),
    isBlocked: z.boolean().optional().default(false),
    dueDate: z.string().datetime().optional().nullable(),
  }).strict(),
});

export const updateTaskSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid task ID format"),
  }),
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
    status: z.enum(VALID_TASK_STATUSES).optional(),
    isBlocked: z.boolean().optional(),
    dueDate: z.string().datetime().optional().nullable(),
    sprintId: z.string().uuid().optional().nullable(),
    assigneeId: z.string().uuid().optional().nullable(),
  }).refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  }),
});

export const getTaskSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid task ID format"),
  }),
});

export const getTasksQuerySchema = z.object({
  query: z.object({
    projectId: z.string().uuid("projectId query parameter is required and must be a valid UUID"),
    status: z.enum(VALID_TASK_STATUSES).optional(),
    isBlocked: z.enum(["true", "false"]).optional(),
    isOverdue: z.enum(["true", "false"]).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    cursor: z.string().optional(),
  }),
});
