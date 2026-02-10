import express from "express";
import { protectRoute } from "../middleware/auth.js";
import { createGroup, getGroups, getGroupMessages, sendGroupMessage, updateGroup, joinGroup } from "../controllers/groupController.js";

const router = express.Router();

router.post("/create", protectRoute, createGroup);
router.get("/", protectRoute, getGroups);
router.get("/:groupId/messages", protectRoute, getGroupMessages);
router.post("/send/:groupId", protectRoute, sendGroupMessage);
router.put("/update/:groupId", protectRoute, updateGroup);
router.post("/join/:groupId", protectRoute, joinGroup);

export default router;
