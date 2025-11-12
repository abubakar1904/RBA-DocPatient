import Speciality from "../../models/speciality.js";
import { invalidateMetaCache } from "./metaPublicController.js";

export const listSpecialities = async (req, res) => {
  try {
    const { includeInactive } = req.query;
    const filter = includeInactive === "true" ? {} : { active: true };
    const specialities = await Speciality.find(filter).sort({ sortOrder: 1, name: 1 });
    res.json({ specialities });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to load specialities" });
  }
};

export const createSpeciality = async (req, res) => {
  try {
    const { name, slug, active = true, sortOrder = 0 } = req.body || {};
    if (!name) return res.status(400).json({ message: "Name is required" });
    const speciality = await Speciality.create({ name, slug, active, sortOrder });
    res.status(201).json({ speciality });
    invalidateMetaCache();
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: "Slug already exists" });
    }
    res.status(500).json({ message: err.message || "Failed to create speciality" });
  }
};

export const updateSpeciality = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, active, sortOrder } = req.body || {};
    const update = {};
    if (name !== undefined) update.name = name;
    if (slug !== undefined) update.slug = slug;
    if (active !== undefined) update.active = active;
    if (sortOrder !== undefined) update.sortOrder = sortOrder;
    const speciality = await Speciality.findByIdAndUpdate(id, update, { new: true, runValidators: true });
    if (!speciality) return res.status(404).json({ message: "Speciality not found" });
    res.json({ speciality });
    invalidateMetaCache();
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: "Slug already exists" });
    }
    res.status(500).json({ message: err.message || "Failed to update speciality" });
  }
};

export const deleteSpeciality = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Speciality.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Speciality not found" });
    res.json({ message: "Speciality deleted" });
    invalidateMetaCache();
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to delete speciality" });
  }
};


