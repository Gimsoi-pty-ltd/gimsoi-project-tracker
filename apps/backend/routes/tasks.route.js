import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import authorize from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * GET /api/tasks — VIEW_PROGRESS
 * Allowed: ADMIN, PM, INTERN, CLIENT
 */
router.get("/", verifyToken, authorize("VIEW_PROGRESS"), (req, res) => {
    res.json({ message: "Viewing progress: Task list retrieved successfully." });
});

/**
 * POST /api/tasks — CREATE_TASK
 * Allowed: ADMIN, PM
 */
router.post("/", verifyToken, authorize("CREATE_TASK"), (req, res) => {
    res.json({ message: "Task created successfully." });
});

/**
 * PUT /api/tasks/:id — UPDATE_TASK
 * Allowed: ADMIN, INTERN
 */
router.put("/:id", verifyToken, authorize("UPDATE_TASK"), (req, res) => {
    res.json({ message: `Task ${req.params.id} updated successfully.` });
});

/**
 * DELETE /api/tasks/:id — DELETE_TASK
 * Allowed: ADMIN
 */
router.delete("/:id", verifyToken, authorize("DELETE_TASK"), (req, res) => {
    res.json({ message: `Task ${req.params.id} deleted successfully.` });
});

export default router;
