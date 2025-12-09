const express = require("express");
const { authRequired, requireRole } = require("../middleware/auth");
const Category = require("../models/Category");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// Ensure upload dir exists
const uploadDir = path.join(__dirname, "..", "uploads", "categories");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path
      .basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 40);
    cb(null, `${Date.now()}-${base}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype?.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

function deleteFileIfExists(fileUrl) {
  try {
    if (!fileUrl) return;
    const filename = path.basename(fileUrl);
    const fullPath = path.join(uploadDir, filename);
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
  } catch (e) {
    console.warn("Failed to delete file:", e.message);
  }
}

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

function slugify(str) {
  return str
    .toString()
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 60);
}

// Admin create
router.post(
  "/",
  authRequired,
  requireRole("admin"),
  upload.single("image"),
  async (req, res) => {
    try {
      const { name, description } = req.body || {};
      if (!name) return res.status(400).json({ error: "Name is required" });

      const slug = slugify(name) || `cat-${Date.now()}`;
      const imageUrl = req.file
        ? `/uploads/categories/${req.file.filename}`
        : "";
      const created = await Category.create({
        name,
        slug,
        description,
        imageUrl,
      });
      return res.status(201).json(created);
    } catch (e) {
      if (e.code === 11000)
        return res
          .status(409)
          .json({ error: "Category name or slug already exists" });
      console.error("Create category error:", e);
      return res
        .status(500)
        .json({ error: e.message || "Failed to create category" });
    }
  }
);

// Admin update
router.put(
  "/:id",
  authRequired,
  requireRole("admin"),
  upload.single("image"),
  async (req, res) => {
    try {
      const { name, description } = req.body || {};
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid category id" });
      }

      const cat = await Category.findById(id);
      if (!cat) return res.status(404).json({ error: "Category not found" });

      if (name != null) {
        cat.name = name;
        cat.slug = slugify(name) || `cat-${Date.now()}`;
      }
      if (description != null) cat.description = description;

      if (req.file) {
        // Replace image
        if (cat.imageUrl) {
          deleteFileIfExists(cat.imageUrl);
        }
        cat.imageUrl = `/uploads/categories/${req.file.filename}`;
      }

      await cat.save();
      return res.json(cat);
    } catch (e) {
      if (e.code === 11000)
        return res
          .status(409)
          .json({ error: "Category name or slug already exists" });
      console.error("Update category error:", e);
      return res
        .status(500)
        .json({ error: e.message || "Failed to update category" });
    }
  }
);

// Admin delete
router.delete("/:id", authRequired, requireRole("admin"), async (req, res) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Category not found" });
    deleteFileIfExists(deleted.imageUrl);
    return res.json({ success: true });
  } catch (e) {
    console.error("Delete category error:", e);
    return res.status(500).json({ error: "Failed to delete category" });
  }
});

module.exports = router;
