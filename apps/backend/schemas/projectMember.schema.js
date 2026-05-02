import { z } from "zod";

export const addMemberSchema = z.object({
    userId: z.string().uuid(),
    role: z.enum(["OWNER", "MEMBER", "VIEWER"]).optional().default("MEMBER")
});

export const updateMemberRoleSchema = z.object({
    role: z.enum(["OWNER", "MEMBER", "VIEWER"])
});
