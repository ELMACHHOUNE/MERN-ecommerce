const express = require("express");
const { authRequired, requireRole } = require("../middleware/auth");
const Category = require("../models/Category");
const mongoose = require("mongoose");

const router = express.Router();

// Public list
router.get("/", async (_req, res) => {
  try {
    const cats = await Category.find().sort({ createdAt: -1 }).lean();
    return res.json(cats);
  } catch (e) {
    console.error("List categories error:", e);
    return res.status(500).json({ error: "Failed to load categories" });
  }
});

// Public single (optional)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid category id" });
    }
    const cat = await Category.findById(id).lean();
    if (!cat) return res.status(404).json({ error: "Category not found" });
    return res.json(cat);
  } catch (e) {
    console.error("Get category error:", e);
    return res.status(500).json({ error: "Failed to load category" });
  }
});

// Admin create
router.post("/", authRequired, requireRole("admin"), async (req, res) => {
  try {
    const { name, description } = req.body || {};
    if (!name) return res.status(400).json({ error: "Name is required" });
    const created = await Category.create({ name, description });
    return res.status(201).json(created);
  } catch (e) {
    if (e.code === 11000)
      return res
        .status(409)
        .json({ error: "Category name or slug already exists" });
    console.error("Create category error:", e);
    return res.status(500).json({ error: "Failed to create category" });
  }
});

// Admin update
router.put("/:id", authRequired, requireRole("admin"), async (req, res) => {
  try {
    const { name, description } = req.body || {};
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ error: "Category not found" });
    if (name != null) cat.name = name;
    if (description != null) cat.description = description;
    await cat.save();
    return res.json(cat);
  } catch (e) {
    if (e.code === 11000)
      return res
        .status(409)
        .json({ error: "Category name or slug already exists" });
    console.error("Update category error:", e);
    return res.status(500).json({ error: "Failed to update category" });
  }
});

// Admin delete
router.delete("/:id", authRequired, requireRole("admin"), async (req, res) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Category not found" });
    return res.json({ success: true });
  } catch (e) {
    console.error("Delete category error:", e);
    return res.status(500).json({ error: "Failed to delete category" });
  }
});

module.exports = router;
