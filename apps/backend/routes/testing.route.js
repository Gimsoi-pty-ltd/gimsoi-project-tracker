import express from "express";
import { resetDatabase } from "../controllers/testing.controller.js";

const router = express.Router();

// This entire router is disabled inside server.js if not in 'test' mode,
// but checking inside the controller adds a second defensive layer.
router.post("/reset", resetDatabase);

export default router;
