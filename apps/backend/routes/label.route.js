import express from "express";
import { verifyToken } from "../middleware/verify-token.middleware.js";
import authorize from "../middleware/auth.middleware.js";
import { readLimiter, writeLimiter } from "../middleware/rate-limiter.middleware.js";
import { updateLabel, deleteLabel, createLabel } from "../controllers/label.controller.js";
import { requireCSRF } from "../middleware/csrf.middleware.js";
import prisma from "../lib/prisma.js";

const router = express.Router();

/**
 * GET /api/labels
 * Lists labels (optionally scoped by projectId)
 */
router.get("/", readLimiter, verifyToken, async (req, res, next) => {
    try {
        const { projectId } = req.query;
        const whereClause = projectId ? { projectId } : {};
        const labels = await prisma.label.findMany({
            where: whereClause,
            orderBy: { name: "asc" }
        });
        return res.status(200).json({
            success: true,
            data: labels
        });
    } catch (err) {
        next(err);
    }
});

/**
 * POST /api/labels
 * Creates a label. Expects projectId in body.
 */
router.post("/", writeLimiter, verifyToken, authorize("MANAGE_PROJECTS"), requireCSRF, createLabel);

/**
 * PATCH /api/labels/:id
 * Updates a label
 */
router.patch("/:id", writeLimiter, verifyToken, authorize("MANAGE_PROJECTS"), requireCSRF, updateLabel);

/**
 * DELETE /api/labels/:id
 * Deletes a label
 */
router.delete("/:id", writeLimiter, verifyToken, authorize("MANAGE_PROJECTS"), requireCSRF, deleteLabel);

export default router;
