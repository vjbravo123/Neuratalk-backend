import { OtpSender } from "../utils/sendOtp.js";
import User from "../model/user.js";
import bcrypt from "bcrypt";


export const googleAuth = async (req, res) => {
  try {
    const { email, name, picture, email_verified } = req.body;

    if (!email) return res.status(400).json({ success: false, message: "Email is required" });

    let user = await User.findOne({ email });

    if (!user) {
      // ✅ Create a new user
      user = new User({
        name,
        email,
        isVerified: email_verified || true, // Google users are verified
      });
      await user.save();
      console.log("🆕 New Google user created:", email);
    } else {
      // ✅ Update existing user info if needed
      user.name = name || user.name;
      user.isVerified = true;
      await user.save();
      console.log("🔁 Existing Google user logged in:", email);
    }

    // ✅ Return success response
    res.status(200).json({
      success: true,
      message: "Google login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        picture,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("❌ Error in Google Auth:", error);
    res.status(500).json({ success: false, message: "Server error during Google login" });
  }
};



// ✅ Send OTP
export const sendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    const existingUser = await User.findOne({ email });

    // ✅ If user exists and has password → normal login flow
    if (existingUser && existingUser.password) {
      return res.json({
        userExists: true,
        passwordExists: true,
        message: "User already registered. Enter password to continue.",
      });
    }

    // ✅ If user is already verified (e.g., via Google)
    if (existingUser && existingUser.isVerified && !existingUser.password) {
      return res.json({
        userExists: true,
        passwordExists: false,
        message: "User already verified. Please sign in with Google.",
      });
    }

    // ✅ Otherwise, send OTP using the util
    const result = await OtpSender(email, existingUser?.name || "NewUser");
    res.json(result);

  } catch (err) {
    console.error("Error sending OTP:", err);
    res.status(500).json({ error: "Error sending OTP" });
  }
};


// ✅ Verify OTP
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (user.otp !== Number(otp)) return res.status(400).json({ success: false, message: "Invalid OTP" });
    if (user.otpExpiry < new Date()) return res.status(400).json({ success: false, message: "OTP expired" });

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error verifying OTP" });
  }
};

// ✅ Set password after OTP verification
export const setPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔹 Check if email and password provided
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    // 🔹 Find the user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 🔹 Ensure user verified their OTP first
    if (!user.isVerified) {
      return res.status(400).json({ success: false, message: "Please verify your OTP before setting a password" });
    }

    // 🔹 Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password set successfully! You can now log in.",
    });
  } catch (error) {
    console.error("❌ Error setting password:", error);
    res.status(500).json({ success: false, message: "Server error while setting password" });
  }
};


// ✅ Register user with password (after verification)
export const registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (!user.isVerified) return res.status(400).json({ success: false, message: "Email not verified" });

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ success: true, message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error registering user" });
  }
};

// ✅ Login route
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (!user.isVerified) return res.status(400).json({ success: false, message: "User not verified" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Incorrect password" });

    res.json({ success: true, message: "Login successful", user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error during login" });
  }
};
