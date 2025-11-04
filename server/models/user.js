import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["doctor", "patient"], default: "patient" },
  verified: { type: Boolean, default: false },
  otp: String,
  otpExpires: Date,
  resetToken: String,
  resetExpires: Date,
  profileCompleted: { type: Boolean, default: false },
  avatarUrl: String,
  phone: String,
  bio: String,
});

export default mongoose.model("User", userSchema);
