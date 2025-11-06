import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/user.js";
import { sendEmail } from "../utils/sendEmail.js";
import path from "path";

export const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await User.create({
      name,
      email,
      password: hashed,
      role,
      otp,
      otpExpires: new Date(Date.now() + 5 * 60 * 1000),
    });

    const { previewUrl } = await sendEmail(email, "Verify OTP", `Your OTP is ${otp}`);

    if (process.env.NODE_ENV !== "production") {
      return res.json({ message: "OTP sent to email", previewUrl, devOtp: otp });
    }

    res.json({ message: "OTP sent to email" });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to send OTP email" });
  }
};

export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "User not found" });
  if (user.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });
  if (user.otpExpires < Date.now())
    return res.status(400).json({ message: "OTP expired" });

  user.verified = true;
  user.otp = null;
  await user.save();
  res.json({ message: "Email verified successfully" });
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    
    if (!user.verified) {
      return res.status(403).json({ message: "Email not verified. Please verify your email first.", email: user.email });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const userInfo = { name: user.name, email: user.email, role: user.role, profileCompleted: !!user.profileCompleted, avatarUrl: user.avatarUrl };
    res.json({ message: "Login successful", token, role: user.role, user: userInfo });
  } catch (err) {
    res.status(500).json({ message: err.message || "Login failed" });
  }
};

export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.verified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    const { previewUrl } = await sendEmail(email, "Verify OTP", `Your OTP is ${otp}`);

    if (process.env.NODE_ENV !== "production") {
      return res.json({ message: "OTP resent to email", previewUrl, devOtp: otp });
    }

    res.json({ message: "OTP resent to email" });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to resend OTP" });
  }
};

// Forgot password: send reset link
export const forgotPassword = async (req,res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset?token=${token}`;
    await sendEmail(user.email, "Password Reset", `Reset your password: ${resetUrl}`);

    return res.json({ message: "Reset link sent to your email" });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Failed to send reset email" });
  }
};

// Reset password: set new password using token
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const user = await User.findOne({ resetToken: token, resetExpires: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    const hashed = await bcrypt.hash(password, 10);
    user.password = hashed;
    user.resetToken = undefined;
    user.resetExpires = undefined;
    await user.save();
    res.json({ message: "Password has been reset successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to reset password" });
  }
};

// Update profile with optional avatar upload
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, bio } = req.body;

    const updates = { profileCompleted: true };
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (bio) updates.bio = bio;
    if (req.file) {
      // build public URL
      updates.avatarUrl = `/uploads/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(userId, updates, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });

    const userInfo = {
      name: user.name,
      email: user.email,
      role: user.role,
      profileCompleted: !!user.profileCompleted,
      avatarUrl: user.avatarUrl,
      phone: user.phone,
      bio: user.bio,
    };

    res.json({ message: "Profile updated", user: userInfo });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to update profile" });
  }
};

// Get current user profile
export const me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const userInfo = {
      name: user.name,
      email: user.email,
      role: user.role,
      profileCompleted: !!user.profileCompleted,
      avatarUrl: user.avatarUrl,
      phone: user.phone,
      bio: user.bio,
    };
    res.json({ user: userInfo });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to load profile" });
  }
};



