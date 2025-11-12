import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import AuthRouter from "./routes/authRouter.js";
import ChatRouter from "./routes/chatRouter.js"; // New chat routes
import { connectDB } from "./config/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB(MONGO_URL);

// Routes
app.use("/api/auth", AuthRouter);
app.use("/api/chat", ChatRouter); // Chat routes

// Health check route
app.get("/", (req, res) => {
  res.send("Server is running...");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!", error: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
