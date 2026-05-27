import express from "express";

const router = express.Router();

router.get("/login", (req, res) => {
  const params = new URLSearchParams({
    scope: "ZohoProjects.projects.READ",
    client_id: process.env.ZOHO_CLIENT_ID,
    response_type: "code",
    access_type: "offline",
    redirect_uri: process.env.ZOHO_REDIRECT_URI,
  });

  res.redirect(`https://accounts.zoho.com/oauth/v2/auth?${params}`);
});

router.get("/callback", async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({
      success: false,
      message: "Missing authorization code",
    });
  }

  try {
    const response = await fetch("https://accounts.zoho.com/oauth/v2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: process.env.ZOHO_CLIENT_ID,
        client_secret: process.env.ZOHO_CLIENT_SECRET,
        redirect_uri: process.env.ZOHO_REDIRECT_URI,
        code,
      }),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      return res.status(response.ok && data.error ? 400 : response.status).json({
        success: false,
        message: data.error || "Zoho authentication failed",
        error: data
      });
    }

    res.status(200).json({
      success: true,
      message: "Zoho authentication flow completed",
      data,
    });
  } catch (error) {
    console.error("Zoho OAuth error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to communicate with Zoho API",
      error: error.message
    });
  }
});

export default router;
