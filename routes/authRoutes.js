// ✅ CORRECT
import express from "express";
import { protect } from "../middleware/authMiddleware.js"; // ← add this
import {
  register,
  verifyEmail,
  resendEmailOtp,
  sendPhoneOtpController,
  verifyPhone,
  login,
  getProfile,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register",         register);
router.post("/verify-email",     verifyEmail);
router.post("/resend-email-otp", resendEmailOtp);
router.post("/send-phone-otp",   sendPhoneOtpController);
router.post("/verify-phone",     verifyPhone);
router.post("/login",            login);

// Protected
router.get("/profile", protect, getProfile); // only if getProfile exists

export default router;