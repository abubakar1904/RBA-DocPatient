import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["doctor", "patient", "admin"], default: "patient" },
  verified: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  approved: { type: Boolean, default: false }, // for doctors approval workflow
  otp: String,
  otpExpires: Date,
  resetToken: String,
  resetExpires: Date,
  profileCompleted: { type: Boolean, default: false },
  avatarUrl: String,
  phone: String,
  bio: String,
  doctorDetails: {
    certificateNumber: String,
    qualifications: String,
    categories: [String],
    specialities: [String],
    clinicName: String,
    clinicAddress: String,
    yearsOfExperience: Number,
    consultationFee: Number,
    availability: {
      days: [String],
      startTime: String,
      endTime: String,
      slotDuration: Number,
      slotsPerDay: Number,
    },
  },
}, { timestamps: true });

export default mongoose.model("User", userSchema);
