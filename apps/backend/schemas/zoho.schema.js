import { z } from "zod";

export const transformProjectSchema = z.record(z.string(), z.any());

export const transformProjectsSchema = z.union([
    z.array(z.record(z.string(), z.any())),
    z.object({ projects: z.array(z.record(z.string(), z.any())) }),
]);
