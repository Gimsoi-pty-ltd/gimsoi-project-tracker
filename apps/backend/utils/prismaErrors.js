import pkg from "../lib/generated/prisma/index.js";
const { Prisma } = pkg;
import { NotFoundError, ConflictError, ValidationError } from "./errors.js";

export const handlePrismaError = (err) => {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2002") throw new ConflictError("A resource with that value already exists.");
        if (err.code === "P2025") throw new NotFoundError("Record not found.");
        if (err.code === "P2003") throw new ConflictError("A required related resource does not exist.");
        if (err.code === "P2009" || err.code === "P2019") throw new ValidationError(`Invalid data provided: ${err.message}`);
    }
    throw err;
};
