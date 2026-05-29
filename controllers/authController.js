import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { sendEmailOtp } from "../utils/sendEmail.js";
import { sendPhoneOtp } from "../utils/sendSMS.js";

// ── Helpers ───────────────────────────────────────────────────
const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// ─────────────────────────────────────────────────────────────
// REGISTER  →  POST /api/auth/register
// ─────────────────────────────────────────────────────────────
export const register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already registered" });

    const user = await User.create({ name, email, phone, password });

    const otp = generateOtp();
    user.emailOtp       = otp;
    user.emailOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    await sendEmailOtp(email, otp);

    res.status(201).json({
      message: "Registered! OTP sent to your email.",
      userId: user._id,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// VERIFY EMAIL  →  POST /api/auth/verify-email
// ─────────────────────────────────────────────────────────────
export const verifyEmail = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId).select(
      "+emailOtp +emailOtpExpiry"
    );

    if (!user)                      return res.status(404).json({ message: "User not found" });
    if (user.isEmailVerified)       return res.status(400).json({ message: "Email already verified" });
    if (user.emailOtp !== otp)      return res.status(400).json({ message: "Invalid OTP" });
    if (user.emailOtpExpiry < Date.now()) return res.status(400).json({ message: "OTP expired" });

    user.isEmailVerified = true;
    user.emailOtp        = undefined;
    user.emailOtpExpiry  = undefined;
    await user.save({ validateBeforeSave: false });

    res.json({ message: "Email verified successfully ✓" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// RESEND EMAIL OTP  →  POST /api/auth/resend-email-otp
// ─────────────────────────────────────────────────────────────
export const resendEmailOtp = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user)               return res.status(404).json({ message: "User not found" });
    if (user.isEmailVerified) return res.status(400).json({ message: "Email already verified" });

    const otp = generateOtp();
    user.emailOtp       = otp;
    user.emailOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    await sendEmailOtp(user.email, otp);

    res.json({ message: "OTP resent to your email" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// SEND PHONE OTP  →  POST /api/auth/send-phone-otp
// ─────────────────────────────────────────────────────────────
export const sendPhoneOtpController = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user)       return res.status(404).json({ message: "User not found" });
    if (!user.phone) return res.status(400).json({ message: "No phone number on account" });

    const otp = generateOtp();
    user.phoneOtp       = otp;
    user.phoneOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    await sendPhoneOtp(user.phone, otp);

    res.json({ message: "OTP sent to your phone" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// VERIFY PHONE  →  POST /api/auth/verify-phone
// ─────────────────────────────────────────────────────────────
export const verifyPhone = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId).select(
      "+phoneOtp +phoneOtpExpiry"
    );

    if (!user)                       return res.status(404).json({ message: "User not found" });
    if (user.isPhoneVerified)        return res.status(400).json({ message: "Phone already verified" });
    if (user.phoneOtp !== otp)       return res.status(400).json({ message: "Invalid OTP" });
    if (user.phoneOtpExpiry < Date.now()) return res.status(400).json({ message: "OTP expired" });

    user.isPhoneVerified = true;
    user.phoneOtp        = undefined;
    user.phoneOtpExpiry  = undefined;
    await user.save({ validateBeforeSave: false });

    res.json({ message: "Phone verified successfully ✓" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// LOGIN  →  POST /api/auth/login
// ─────────────────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: "Invalid credentials" });

    if (!user.isEmailVerified)
      return res.status(403).json({
        message: "Please verify your email first",
        userId: user._id,
      });

    const token = signToken(user._id);

    res.json({
      message: "Login successful",
      token,
      user: {
        id:              user._id,
        name:            user.name,
        email:           user.email,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};