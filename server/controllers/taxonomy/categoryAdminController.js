import Category from "../../models/category.js";
import { invalidateMetaCache } from "./metaPublicController.js";

// List all categories (optionally include inactive)
export const listCategories = async (req, res) => {
  try {
    const { includeInactive } = req.query;
    const filter = includeInactive === "true" ? {} : { active: true };
    const categories = await Category.find(filter).sort({ sortOrder: 1, name: 1 });
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to load categories" });
  }
};

// Create a new category
export const createCategory = async (req, res) => {
  try {
    const { name, slug, active = true, sortOrder = 0 } = req.body || {};
    if (!name) return res.status(400).json({ message: "Name is required" });
    const category = await Category.create({ name, slug, active, sortOrder });
    res.status(201).json({ category });
    invalidateMetaCache();
  } catch (err) {
    // Handle duplicate slug or validation errors
    if (err?.code === 11000) {
      return res.status(409).json({ message: "Slug already exists" });
    }
    res.status(500).json({ message: err.message || "Failed to create category" });
  }
};

// Update category (partial)
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, active, sortOrder } = req.body || {};
    const update = {};
    if (name !== undefined) update.name = name;
    if (slug !== undefined) update.slug = slug;
    if (active !== undefined) update.active = active;
    if (sortOrder !== undefined) update.sortOrder = sortOrder;
    const category = await Category.findByIdAndUpdate(id, update, { new: true, runValidators: true });
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json({ category });
    invalidateMetaCache();
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: "Slug already exists" });
    }
    res.status(500).json({ message: err.message || "Failed to update category" });
  }
};

// Delete category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Category.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Category not found" });
    res.json({ message: "Category deleted" });
    invalidateMetaCache();
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to delete category" });
  }
};


