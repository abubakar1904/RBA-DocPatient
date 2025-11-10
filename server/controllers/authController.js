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

    const userInfo = { name: user.name, email: user.email, role: user.role, profileCompleted: !!user.profileCompleted, avatarUrl: user.avatarUrl, doctorDetails: user.doctorDetails };
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
      doctorDetails: user.doctorDetails,
    };

    res.json({ message: "Profile updated", user: userInfo });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to update profile" });
  }
};

// Update doctor profile details (doctor only)
export const updateDoctorProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      certificateNumber,
      qualifications,
      categories,
      specialities,
      clinicName,
      clinicAddress,
      yearsOfExperience,
      consultationFee,
      availability,
    } = req.body;

    const toArray = (value) => {
      if (!value) return undefined;
      if (Array.isArray(value)) return value.filter(Boolean);
      if (typeof value === "string")
        return value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      return undefined;
    };

    const availabilityPayload = availability || {};
    const days = toArray(availabilityPayload.days);

    const updates = {
      profileCompleted: true,
      doctorDetails: {
        certificateNumber,
        qualifications,
        categories: toArray(categories),
        specialities: toArray(specialities),
        clinicName,
        clinicAddress,
        yearsOfExperience: yearsOfExperience !== undefined && yearsOfExperience !== "" ? Number(yearsOfExperience) : undefined,
        consultationFee: consultationFee !== undefined && consultationFee !== "" ? Number(consultationFee) : undefined,
        availability: {
          days,
          startTime: availabilityPayload.startTime || undefined,
          endTime: availabilityPayload.endTime || undefined,
          slotDuration:
            availabilityPayload.slotDuration !== undefined && availabilityPayload.slotDuration !== ""
              ? Number(availabilityPayload.slotDuration)
              : undefined,
          slotsPerDay:
            availabilityPayload.slotsPerDay !== undefined && availabilityPayload.slotsPerDay !== ""
              ? Number(availabilityPayload.slotsPerDay)
              : undefined,
        },
      },
    };

    // Remove undefined keys from nested object
    Object.keys(updates.doctorDetails).forEach((k) => updates.doctorDetails[k] === undefined && delete updates.doctorDetails[k]);
    if (updates.doctorDetails.availability) {
      Object.keys(updates.doctorDetails.availability).forEach(
        (k) => updates.doctorDetails.availability[k] === undefined && delete updates.doctorDetails.availability[k]
      );
      if (
        Object.keys(updates.doctorDetails.availability).length === 0 ||
        !updates.doctorDetails.availability.days ||
        updates.doctorDetails.availability.days.length === 0
      ) {
        delete updates.doctorDetails.availability;
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    const userInfo = {
      name: user.name,
      email: user.email,
      role: user.role,
      profileCompleted: !!user.profileCompleted,
      avatarUrl: user.avatarUrl,
      phone: user.phone,
      bio: user.bio,
      doctorDetails: user.doctorDetails,
    };

    res.json({ message: "Doctor profile updated", user: userInfo });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to update doctor profile" });
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
      doctorDetails: user.doctorDetails,
    };
    res.json({ user: userInfo });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to load profile" });
  }
};

export const listDoctors = async (req, res) => {
  try {
    const { speciality } = req.query;
    const filter = { role: "doctor", profileCompleted: true };
    if (speciality) {
      const specials = Array.isArray(speciality)
        ? speciality
        : speciality.split(",").map((item) => item.trim()).filter(Boolean);
      if (specials.length > 0) {
        filter["doctorDetails.specialities"] = { $in: specials };
      }
    }

    const doctors = await User.find(filter).select(
      "name email avatarUrl doctorDetails.certificateNumber doctorDetails.qualifications doctorDetails.categories doctorDetails.specialities doctorDetails.availability doctorDetails.clinicName doctorDetails.clinicAddress doctorDetails.consultationFee"
    );

    const result = doctors.map((doc) => ({
      id: doc._id,
      name: doc.name,
      email: doc.email,
      avatarUrl: doc.avatarUrl,
      certificateNumber: doc.doctorDetails?.certificateNumber,
      qualifications: doc.doctorDetails?.qualifications,
      categories: doc.doctorDetails?.categories || [],
      specialities: doc.doctorDetails?.specialities || [],
      clinicName: doc.doctorDetails?.clinicName,
      clinicAddress: doc.doctorDetails?.clinicAddress,
      consultationFee: doc.doctorDetails?.consultationFee,
      availability: doc.doctorDetails?.availability || {},
    }));

    const allSpecialities = Array.from(
      new Set(result.flatMap((doc) => doc.specialities || []))
    ).sort();

    res.json({ doctors: result, specialities: allSpecialities });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to load doctors" });
  }
};

export const listPatients = async (req, res) => {
  try {
    const patients = await User.find({ role: "patient" }).select(
      "name email avatarUrl phone bio profileCompleted createdAt"
    );

    const result = patients.map((patient) => ({
      id: patient._id,
      name: patient.name,
      email: patient.email,
      avatarUrl: patient.avatarUrl,
      phone: patient.phone,
      bio: patient.bio,
      profileCompleted: !!patient.profileCompleted,
      joinedAt: patient.createdAt,
    }));

    res.json({ patients: result });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to load patients" });
  }
};

// Elevate a user's role to admin (secured by setup token)
export const makeAdmin = async (req, res) => {
  try {
    const { email, token } = req.body;
    if (!email || !token) {
      return res.status(400).json({ message: "Email and token are required" });
    }
    if (!process.env.ADMIN_SETUP_TOKEN || token !== process.env.ADMIN_SETUP_TOKEN) {
      return res.status(401).json({ message: "Invalid setup token" });
    }
    const user = await User.findOneAndUpdate({ email }, { role: "admin" }, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User promoted to admin", user: { email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to promote user" });
  }
};



