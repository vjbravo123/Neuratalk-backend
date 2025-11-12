import Brevo from "@getbrevo/brevo";
import dotenv from "dotenv";
import User from "../model/user.js";

dotenv.config();

const brevoApiKey = process.env.BREVO_API_KEY;
const userEmail = process.env.EMAIL_USER;

export const OtpSender = async (email, name) => {
  try {
    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // valid for 5 min

    // ✅ Save OTP to DB (create or update)
    const user = await User.findOneAndUpdate(
      { email },
      { name, otp, otpExpiry, isVerified: false },
      { new: true, upsert: true }
    );

    // ✅ Send via Brevo
    const apiInstance = new Brevo.TransactionalEmailsApi();
    apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, brevoApiKey);

    const sendSmtpEmail = {
      to: [{ email, name }],
      sender: { email: userEmail, name: "NeuraTalk" },
      subject: "OTP Verification - NeuraTalk 🚀",
      htmlContent: `
        <h2>Hello ${name} 👋</h2>
        <p>Your OTP for email verification is:</p>
        <h3>${otp}</h3>
        <p>This OTP will expire in <b>5 minutes</b>.</p>
        <br/>
        <small>Sent at: ${new Date().toLocaleString()}</small>
      `,
    };

    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("✅ OTP sent successfully");

    return { success: true, message: "OTP sent successfully" };
  } catch (error) {
    console.error("❌ Error sending OTP:", error);
    return { success: false, message: "Failed to send OTP" };
  }
};
