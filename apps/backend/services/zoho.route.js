import express from "express";

import {
  fetchZohoPortals,
  fetchZohoProjects,
  fetchZohoTasks,
} from "../controllers/zoho.controller.js";

import { verifyToken } from "../middleware/auth.middleware.js";
import { requireAnyRole } from "../middleware/rbac.middleware.js";

const router = express.Router();

router.use(verifyToken);
router.use(requireAnyRole("Admin", "PM"));

router.get("/portals", fetchZohoPortals);
router.get("/portals/:portalId/projects", fetchZohoProjects);
router.get("/portals/:portalId/projects/:projectId/tasks", fetchZohoTasks);

export default router;
