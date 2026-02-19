import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import authorize from "../middleware/authMiddleware.js";
import { readLimiter, writeLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

/**
 * GET /api/tasks — VIEW_PROGRESS
 * Allowed: ADMIN, PM, INTERN, CLIENT
 */
router.get("/", readLimiter, verifyToken, authorize("VIEW_PROGRESS"), (req, res) => {
    res.json({ message: "Viewing progress: Task list retrieved successfully." });
});

/**
 * POST /api/tasks — CREATE_TASK
 * Allowed: ADMIN, PM
 */
router.post("/", writeLimiter, verifyToken, authorize("CREATE_TASK"), (req, res) => {
    res.json({ message: "Task created successfully." });
});

/**
 * PUT /api/tasks/:id — UPDATE_TASK
 * Allowed: ADMIN, INTERN
 */
router.put("/:id", writeLimiter, verifyToken, authorize("UPDATE_TASK"), (req, res) => {
    res.json({ message: `Task ${req.params.id} updated successfully.` });
});

/**
 * DELETE /api/tasks/:id — DELETE_TASK
 * Allowed: ADMIN
 */
router.delete("/:id", writeLimiter, verifyToken, authorize("DELETE_TASK"), (req, res) => {
    res.json({ message: `Task ${req.params.id} deleted successfully.` });
});

export default router;
