import twilio from "twilio";
import dotenv from "dotenv";
dotenv.config();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

client.messages.create({
  body: "Test OTP: 123456",
  from: process.env.TWILIO_PHONE_NUMBER,
  to: "+917695982064",                 // ← your verified personal number
}).then((msg) => {
  console.log("✅ SMS sent! SID:", msg.sid);
}).catch((err) => {
  console.log("❌ Failed:", err.message);
});