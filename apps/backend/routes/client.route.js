import express from "express";
import { verifyToken } from "../middleware/verify-token.middleware.js";
import authorize from "../middleware/auth.middleware.js";
import { readLimiter, writeLimiter } from "../middleware/rate-limiter.middleware.js";
import {
  createClient,
  getClients,
  getClientById,
} from "../controllers/client.controller.js";
import { requireCSRF } from "../middleware/csrf.middleware.js";

const router = express.Router();

// Everyone logged in can view (including Client role - read-only)
router.get("/", readLimiter, verifyToken, authorize("VIEW_PROGRESS"), getClients);
router.get("/:id", readLimiter, verifyToken, authorize("VIEW_PROGRESS"), getClientById);

// Only Admin/PM can create
router.post("/", writeLimiter, verifyToken, authorize("MANAGE_CLIENTS"), requireCSRF, createClient);

export default router;
