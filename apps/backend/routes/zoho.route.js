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

  const authUrl =
    `https://accounts.zoho.com/oauth/v2/auth?${params.toString()}`;

  res.redirect(authUrl);
});

router.get("/callback", async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Authorization code missing",
      });
    }

    const response = await fetch(
      "https://accounts.zoho.com/oauth/v2/token",
      {
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
      }
    );

    const data = await response.json();

    return res.status(200).json({
      success: true,
      message: "Zoho OAuth successful",
      data,
    });
  } catch (error) {
    console.error("Zoho OAuth Error:", error);

    return res.status(500).json({
      success: false,
      message: "Zoho authentication failed",
    });
  }
});

export default router;
