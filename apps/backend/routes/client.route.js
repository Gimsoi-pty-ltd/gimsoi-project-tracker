import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { requireAnyRole } from "../middleware/rbac.middleware.js";
import {
  createClient,
  getClients,
  getClientById,
} from "../controllers/client.controller.js";

const router = express.Router();

// Everyone logged in can view (including Client role - read-only)
router.get("/", verifyToken, requireAnyRole(["Admin", "PM", "Intern", "Client"]), getClients);
router.get("/:id", verifyToken, requireAnyRole(["Admin", "PM", "Intern", "Client"]), getClientById);

// Only Admin/PM can create
router.post("/", verifyToken, requireAnyRole(["Admin", "PM"]), createClient);

export default router;
