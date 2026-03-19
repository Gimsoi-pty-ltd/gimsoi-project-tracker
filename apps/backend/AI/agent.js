import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/googleai";
import dotenv from "dotenv";

dotenv.config({ path: '../.env' });

export const ai = genkit({
  plugins: [googleAI({ apiKey: process.env.GEMINI_API_KEY })],
  model: "googleai/gemini-2.0-flash-001",
});

export async function generateResponse(prompt) {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
    return "AI agent not yet implemented";
  }

  try {
    const response = await ai.generate({ prompt });
    return response.text;
  } catch (err) {
    if (err.message.includes('API key not valid') || err.message.includes('API_KEY_INVALID')) {
      return "AI agent not yet implemented";
    }
    throw err;
  }
}