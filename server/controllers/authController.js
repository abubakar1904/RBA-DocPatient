import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { sendEmail } from "../utils/sendEmail.js";

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
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "User not found" });
  if (!user.verified) return res.status(400).json({ message: "Email not verified" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: "Invalid password" });

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  const userInfo = { name: user.name, email: user.email, role: user.role };
  res.json({ message: "Login successful", token, role: user.role, user: userInfo });
};
