import express from "express";

const router = express.Router();

router.get("/login", (req, res) => {
  res.status(501).json({
    success: false,
    message: "Zoho OAuth login is not fully configured yet",
  });
});

router.get("/callback", (req, res) => {
  res.status(501).json({
    success: false,
    message: "Zoho OAuth callback is not fully configured yet",
  });
});

export default router;
