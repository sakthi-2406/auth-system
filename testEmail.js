import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: process.env.EMAIL_USER,      // sends to yourself for testing
  subject: "Test OTP",
  html: "<h1>123456</h1>",
}).then(() => {
  console.log("✅ Email sent successfully! Check your inbox.");
}).catch((err) => {
  console.log("❌ Failed:", err.message);
});