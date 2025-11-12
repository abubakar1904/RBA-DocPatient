import MetaSettings from "../../models/metaSettings.js";
import { invalidateMetaCache } from "./metaPublicController.js";

export const getAvailability = async (req, res) => {
  try {
    let doc = await MetaSettings.findOne();
    if (!doc) doc = await MetaSettings.create({});
    res.json({ availability: doc.availability, updatedAt: doc.updatedAt });
    invalidateMetaCache();
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to load availability" });
  }
};

export const updateAvailability = async (req, res) => {
  try {
    const { startTime, endTime, slotDuration, allowedDays } = req.body || {};
    const doc = await MetaSettings.findOneAndUpdate(
      {},
      {
        $set: {
          "availability.startTime": startTime,
          "availability.endTime": endTime,
          "availability.slotDuration": slotDuration,
          "availability.allowedDays": allowedDays,
        },
      },
      { new: true, upsert: true }
    );
    res.json({ availability: doc.availability, updatedAt: doc.updatedAt });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to update availability" });
  }
};


