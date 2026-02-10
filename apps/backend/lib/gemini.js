import { GoogleGenerativeAI } from "@google/generative-ai";
import { SCAM_DETECTION_PROMPT } from "./prompts.js";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export const checkIsScam = async (messageText) => {
    if (!messageText) return false;

    const prompt = `${SCAM_DETECTION_PROMPT}
    Message: "${messageText}"`;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text().trim().toUpperCase();
        console.log("Gemini Raw Response:", text);
        const isScam = text.includes("TRUE");
        console.log("Gemini Scam Decision:", isScam);

        return isScam;
    } catch (error) {
        console.error("Gemini Scan Error:", error);
        return false; // Fail safe
    }
};
