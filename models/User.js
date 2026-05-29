import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },

    // Email OTP
    emailOtp:        { type: String,  select: false },
    emailOtpExpiry:  { type: Date,    select: false },
    isEmailVerified: { type: Boolean, default: false },

    // Phone OTP
    phoneOtp:        { type: String,  select: false },
    phoneOtpExpiry:  { type: Date,    select: false },
    isPhoneVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ✅ CORRECT - regular function (not arrow) so 'this' works
//             no next parameter needed with async hooks
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;   // ← just return, no next()
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", userSchema);