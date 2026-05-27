import { z } from "zod";

/**
 * Validates the biological and contact data for a Client entity.
 * Used at the controller boundary before service injection.
 */
export const createClientSchema = z.object({
    name: z.string().min(1, "Client name is required"),
    contactEmail: z.string().email("Invalid email format").optional().or(z.literal("")),
    phone: z.string().optional().or(z.literal("")),
});

/**
 * Partial schema for client updates.
 * All fields are optional but must follow the same validation rules if provided.
 */
export const updateClientSchema = createClientSchema.partial();
