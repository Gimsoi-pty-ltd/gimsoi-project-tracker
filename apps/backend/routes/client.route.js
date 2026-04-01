import express from "express";
import { verifyToken } from "../middleware/verify-token.middleware.js";
import authorize from "../middleware/authorize.middleware.js";
import { readLimiter, writeLimiter } from "../middleware/rate-limiter.middleware.js";
import {
  createClient,
  getClients,
  getClientById,
} from "../controllers/client.controller.js";

const router = express.Router();

// Everyone logged in can view (including Client role - read-only)
router.get("/", readLimiter, verifyToken, authorize("VIEW_CLIENTS"), getClients);
// Allowed: ADMIN, PM, INTERN, CLIENT
router.get("/:id", readLimiter, verifyToken, authorize("VIEW_CLIENTS"), getClientById);

// Only Admin/PM can create
router.post("/", writeLimiter, verifyToken, authorize("MANAGE_CLIENTS"), createClient);

export default router;
