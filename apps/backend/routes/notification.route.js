import express from "express";
import rateLimit from "express-rate-limit";
import { 
  getMyNotifications, 
  markAsRead, 
  markAllAsRead 
} from "../controllers/notification.controller.js";
import { verifyToken } from "../middleware/verify-token.middleware.js"; 

const router = express.Router();

// ADDED: Rate limiter to prevent spam (CodeQL security fix)
const notificationLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // Limit each IP to 60 requests per minute
  message: { success: false, message: "Too many requests, please try again later." }
});

// Apply auth and rate limiting to all routes below
// Apply rate limiting before authentication
router.use(notificationLimiter);
router.use(verifyToken);

/**
 * @swagger
 * tags:
 *   - name: Notifications
 *     description: Real-time and persisted user notifications management
 */

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get notifications for authenticated user
 *     description: |
 *       Retrieves the latest notifications (up to 50) for the currently authenticated user, ordered from newest to oldest.
 *       
 *       **Authorization & Isolation:**
 *       - Requires authentication (Bearer token or session cookie).
 *       - Allowed roles: All authenticated users (`ADMIN`, `PM`, `INTERN`, `CLIENT`).
 *       - Scope isolation: Only returns notifications belonging to `req.user.id`. Notifications from other users are strictly excluded.
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of user notifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "c7b89d0e-1f2a-3b4c-5d6e-7f8a9b0c1d2e"
 *                       userId:
 *                         type: string
 *                         example: "d1e2f3a4-b5c6-7d8e-9f0a-1b2c3d4e5f6a"
 *                       title:
 *                         type: string
 *                         example: "Task Assigned"
 *                       message:
 *                         type: string
 *                         example: "You have been assigned to 'Fix login bug'"
 *                       type:
 *                         type: string
 *                         enum: [INFO, ALERT, TASK_ASSIGNED]
 *                         example: "INFO"
 *                       isRead:
 *                         type: boolean
 *                         example: false
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2026-11-19T10:30:00.000Z"
 *       401:
 *         description: Unauthorized - missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Unauthorized - no token provided"
 *       429:
 *         description: Rate limit exceeded (limit 60 requests per minute)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Too many requests, please try again later."
 */
router.get("/", getMyNotifications);

/**
 * @swagger
 * /api/notifications/read-all:
 *   patch:
 *     summary: Mark all notifications as read
 *     description: |
 *       Marks all unread notifications for the currently authenticated user as read (`isRead: true`).
 *       
 *       **Authorization & Isolation:**
 *       - Requires authentication (Bearer token or session cookie).
 *       - Allowed roles: All authenticated users (`ADMIN`, `PM`, `INTERN`, `CLIENT`).
 *       - Strictly updates only notifications matching `userId = req.user.id` and `isRead = false`.
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: All unread notifications marked as read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "All notifications marked as read"
 *       401:
 *         description: Unauthorized - missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Unauthorized - no token provided"
 *       429:
 *         description: Rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Too many requests, please try again later."
 */
router.patch("/read-all", markAllAsRead);

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: Mark a specific notification as read
 *     description: |
 *       Marks an individual notification as read (`isRead: true`).
 *       
 *       **Authorization & Isolation:**
 *       - Requires authentication (Bearer token or session cookie).
 *       - Allowed roles: All authenticated users (`ADMIN`, `PM`, `INTERN`, `CLIENT`).
 *       - Scoped strictly to notifications owned by the authenticated user (`id` and `userId = req.user.id`).
 *       - If the notification does not exist or belongs to another user, returns `404 Not Found`.
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *         example: "c7b89d0e-1f2a-3b4c-5d6e-7f8a9b0c1d2e"
 *     responses:
 *       200:
 *         description: Notification marked as read successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Marked as read"
 *       401:
 *         description: Unauthorized - missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Unauthorized - no token provided"
 *       404:
 *         description: Notification not found or not owned by user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Notification not found"
 *       429:
 *         description: Rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Too many requests, please try again later."
 */
router.patch("/:id/read", markAsRead);


export default router;