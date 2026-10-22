import { z } from "zod";

export const uuidParam = (name) =>
    z.object({
        [name]: z.string().uuid(`${name} must be a valid UUID`),
    });

export const idParamSchema = uuidParam("id");
