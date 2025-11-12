import mongoose from "mongoose";

const { Schema } = mongoose;

const availabilitySchema = new Schema(
  {
    startTime: { type: String, default: "09:00" },
    endTime: { type: String, default: "17:00" },
    slotDuration: { type: Number, default: 30 },
    allowedDays: { type: [String], default: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] },
  },
  { _id: false }
);

const metaSettingsSchema = new Schema(
  {
    availability: { type: availabilitySchema, default: () => ({}) },
  },
  { timestamps: true }
);

export default mongoose.model("MetaSettings", metaSettingsSchema);


