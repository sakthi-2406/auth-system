import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmailOtp = async (to, otp) => {
  await transporter.sendMail({
    from: `"Auth System" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your Email Verification OTP",
    html: `
      <div style="font-family:sans-serif;max-width:420px;margin:auto;padding:24px;
                  border:1px solid #eee;border-radius:10px">
        <h2 style="color:#333">Verify Your Email</h2>
        <p>Use the OTP below. It expires in <strong>10 minutes</strong>.</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:10px;
                    color:#4f46e5;padding:16px 0">${otp}</div>
        <p style="color:#999;font-size:12px">
          If you didn't request this, ignore this email.
        </p>
      </div>
    `,
  });
};