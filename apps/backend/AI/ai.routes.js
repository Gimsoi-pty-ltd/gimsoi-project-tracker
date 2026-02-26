import express from "express";
import { generateResponse } from "./agent.js";
import { getProjectStatus } from "./tools/getProjectStatus.js";

const router = express.Router();

router.post("/ask", async (req, res) => {
  try {
    const { question } = req.body;

    const status = getProjectStatus();

    const fullPrompt = `
      You are an assistant for Gimsoi internal project tracker.
      Here is the current project data: ${JSON.stringify(status)}
      Answer this question: ${question}
    `;

    const answer = await generateResponse(fullPrompt);
    res.json({ answer });

  } catch (error) {
    console.error("AI Error:", error.message);
    res.status(500).json({ error: "AI service failed" });
  }
});

export default router;