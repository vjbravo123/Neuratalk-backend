import express from "express";
import ChatMessage from "../model/ChatMessage.js";
import User from "../model/User.js";
import { GoogleGenAI } from "@google/genai";

const router = express.Router();

// Initialize Gemini client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ✅ Middleware to verify user
// (assuming you’re storing user ID in req.user via auth middleware)
const verifyUser = async (req, res, next) => {
  try {
    // Example: userId comes from frontend token or body
    console.log(req.headers['x-user-id']);
    
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ message: "User ID is required" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    req.user = user;
    next();
  } catch (err) {
    res.status(500).json({ message: "User verification failed", error: err.message });
  }
};

// ✅ Get user-specific chat history
router.get("/history", verifyUser, async (req, res) => {
  try {
    const messages = await ChatMessage.find({ user: req.user._id }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch chat history", error: err.message });
  }
});

// ✅ Send a message (user-specific)
router.post("/send", verifyUser, async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ message: "Message is required" });

  try {
    // Save user's message
    await ChatMessage.create({
      user: req.user._id,
      sender: "user",
      text: message,
    });

    // Generate AI reply
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: message,
      // optional parameters for fine-tuning
      // temperature: 0.5,
      // maxOutputTokens: 512,
    });

    // Extract AI reply text safely
    const aiReply = result?.text?.trim() || "Sorry, I couldn’t process that.";

    // Save AI reply
    await ChatMessage.create({
      user: req.user._id,
      sender: "ai",
      text: aiReply,
    });

    res.json({ reply: aiReply });
  } catch (err) {
    console.error("Gemini API error:", err?.response?.data || err || err.message);
    res.status(500).json({
      message: "Failed to send message",
      error: err?.response?.data || err?.message || err,
    });
  }
});

export default router;
