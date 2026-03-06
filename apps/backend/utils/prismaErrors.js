import pkg from "../lib/generated/prisma/index.js";
const { Prisma } = pkg;
import { NotFoundError } from "./errors.js";

export class ConflictError extends Error {
    constructor(message) {
        super(message);
        this.name = "ConflictError";
        this.statusCode = 409;
    }
}

/**
 * Maps known Prisma error codes to domain errors with correct HTTP status codes.
 * Re-throws unknown errors unchanged so callers' generic catch blocks still handle them.
 *
 * Codes handled:
 *   P2002 — Unique constraint violation  → 409 ConflictError
 *   P2025 — Record not found (in update/delete) → 404 NotFoundError
 *   P2003 — Foreign key constraint → 409 ConflictError (related record missing)
 *
 * @param {unknown} err
 * @throws {ConflictError | NotFoundError | unknown}
 */
export const handlePrismaError = (err) => {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2002") throw new ConflictError("A resource with that value already exists.");
        if (err.code === "P2025") throw new NotFoundError("Record not found.");
        if (err.code === "P2003") throw new ConflictError("A required related resource does not exist.");
    }
    throw err;
};
