import { z } from "zod";

export const createLabelSchema = z.object({
    projectId: z.string().uuid(),
    name: z.string().min(1).max(50),
    color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color").optional()
});

export const attachLabelsSchema = z.object({
    labelIds: z.array(z.string().uuid())
});
