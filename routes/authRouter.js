import express from "express";
import { sendOtp, verifyOtp, registerUser, loginUser, googleAuth, setPassword } from "../controller/authController.js";

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/set-password", setPassword);

// ✅ Google Login route
router.post("/google", googleAuth);

export default router;
