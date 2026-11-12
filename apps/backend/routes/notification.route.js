import express from "express";
import { 
  getMyNotifications, 
  markAsRead, 
  markAllAsRead 
} from "../controllers/notification.controller.js";
import { verifyToken } from "../middleware/verify-token.middleware.js"; 

const router = express.Router();

router.use(verifyToken);

router.get("/", getMyNotifications);
router.patch("/read-all", markAllAsRead);
router.patch("/:id/read", markAsRead);

export default router;