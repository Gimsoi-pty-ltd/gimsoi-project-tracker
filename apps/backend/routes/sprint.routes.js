import express from "express";
import * as sprintController from "../controllers/sprint.controller.js";
import { verifyJWT } from "../middleware/auth.js";

const router = express.Router();

router.post("/", verifyJWT, sprintController.createSprint);
router.get("/", verifyJWT, sprintController.getAllSprints);
router.get("/:id", verifyJWT, sprintController.getSprintById);
router.put("/:id", verifyJWT, sprintController.updateSprint);

export default router;