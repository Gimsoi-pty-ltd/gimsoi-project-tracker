import express from "express";
import { verifyToken } from "../middleware/verify-token.middleware.js";
import authorize from "../middleware/auth.middleware.js";
import { readLimiter, writeLimiter } from "../middleware/rate-limiter.middleware.js";
import {
  createClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient,
} from "../controllers/client.controller.js";
import { requireCSRF } from "../middleware/csrf.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createClientSchema, updateClientSchema } from "../schemas/client.schema.js";
import { idParamSchema } from "../schemas/common.schema.js";

const router = express.Router();

// Everyone logged in can view (including Client role - read-only)
router.get("/", readLimiter, verifyToken, authorize("VIEW_PROGRESS"), getClients);
router.get("/:id", readLimiter, verifyToken, authorize("VIEW_PROGRESS"), validate(idParamSchema, 'params'), getClientById);

// Only Admin/PM can create, update, delete
router.post("/", writeLimiter, verifyToken, authorize("MANAGE_CLIENTS"), requireCSRF, validate(createClientSchema), createClient);
router.patch("/:id", writeLimiter, verifyToken, authorize("MANAGE_CLIENTS"), requireCSRF, validate(idParamSchema, 'params'), validate(updateClientSchema), updateClient);
router.delete("/:id", writeLimiter, verifyToken, authorize("MANAGE_CLIENTS"), requireCSRF, validate(idParamSchema, 'params'), deleteClient);

export default router;
