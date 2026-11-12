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

router.get("/", getMyNotifications);
router.patch("/read-all", markAllAsRead);
router.patch("/:id/read", markAsRead);

export default router;