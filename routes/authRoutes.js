import express from "express";
import {
  register,
  verifyEmail,
  resendEmailOtp,
  sendPhoneOtpController,
  verifyPhone,
  login,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register",          register);
router.post("/verify-email",      verifyEmail);
router.post("/resend-email-otp",  resendEmailOtp);
router.post("/send-phone-otp",    sendPhoneOtpController);
router.post("/verify-phone",      verifyPhone);
router.post("/login",             login);

export default router;