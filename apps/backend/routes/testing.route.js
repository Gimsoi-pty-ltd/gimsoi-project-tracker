import express from "express";
import { resetDatabase, promoteUserRole } from "../controllers/testing.controller.js";
import { verifyToken } from "../middleware/verify-token.middleware.js";
import { requireCSRF } from "../middleware/csrf.middleware.js";

// ADMIN required to wipe the entire database
const adminOnly = (req, res, next) => {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }
  next();
};

const router = express.Router();

// This entire router is disabled inside server.js if not in 'test' mode,
// but checking inside the controller adds a second defensive layer.
router.post("/reset", verifyToken, adminOnly, requireCSRF, resetDatabase);

// Promotes a user's role in the DB so fixtures can create non-INTERN test users.
// Requires re-login after this call to get a fresh JWT reflecting the new role.
router.post("/promote-role", verifyToken, adminOnly, requireCSRF, promoteUserRole);

export default router;
