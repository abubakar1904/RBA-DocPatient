import Category from "../../models/category.js";
import Speciality from "../../models/speciality.js";
import MetaSettings from "../../models/metaSettings.js";

let cached = null;
let cachedAt = 0;
const TTL_MS = 5 * 60 * 1000; // 5 minutes

export const getMeta = async (req, res) => {
  try {
    const now = Date.now();
    if (cached && now - cachedAt < TTL_MS) {
      return res.json(cached);
    }

    const [categories, specialities, settings] = await Promise.all([
      Category.find({ active: true }).sort({ sortOrder: 1, name: 1 }).lean(),
      Speciality.find({ active: true }).sort({ sortOrder: 1, name: 1 }).lean(),
      MetaSettings.findOne().lean(),
    ]);

    const payload = {
      categories: categories.map(({ _id, name, slug, sortOrder }) => ({ id: _id, name, slug, sortOrder })),
      specialities: specialities.map(({ _id, name, slug, sortOrder }) => ({ id: _id, name, slug, sortOrder })),
      availability: settings?.availability || null,
      updatedAt: settings?.updatedAt || null,
    };

    cached = payload;
    cachedAt = now;
    res.json(payload);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to load metadata" });
  }
};

// Invalidate cache helper to call after admin writes
export const invalidateMetaCache = () => {
  cached = null;
  cachedAt = 0;
};


