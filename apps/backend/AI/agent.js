import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/googleai";
import dotenv from "dotenv";

dotenv.config({ path: '../.env' });

export const ai = genkit({
  plugins: [googleAI({ apiKey: process.env.GEMINI_API_KEY })],
  model: "googleai/gemini-2.0-flash-001",
});

export async function generateResponse(prompt) {
  try {
    const response = await ai.generate({ prompt });
    return response.text;
  } catch (err) {
    if (err.message.includes("API key not valid")) {
      throw new Error("Invalid or missing GEMINI_API_KEY. Please check your .env file.");
    }
    throw err;
  }
}

// TEMP TEST — delete this after it works
generateResponse("Say hello from Gimsoi project tracker in one sentence.")
  .then(response => console.log("AI Response:", response))
  .catch(err => {
    if (err.message.includes("API key not valid")) {
      console.error("AI Error: Invalid or missing GEMINI_API_KEY in your .env file.");
    } else {
      console.error("AI Error:", err.message);
    }
  });