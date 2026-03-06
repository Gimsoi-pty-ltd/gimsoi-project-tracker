import express from "express";
import { resetDatabase, promoteUserRole } from "../controllers/testing.controller.js";

const router = express.Router();

// This entire router is disabled inside server.js if not in 'test' mode,
// but checking inside the controller adds a second defensive layer.
router.post("/reset", resetDatabase);

// Promotes a user's role in the DB so fixtures can create non-INTERN test users.
// Requires re-login after this call to get a fresh JWT reflecting the new role.
router.post("/promote-role", promoteUserRole);

export default router;
