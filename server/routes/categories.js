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
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (error) {
  console.log(
    "Warning: Could not create upload directory (expected in read-only environments like Vercel). Uploads may fail."
  );
}

// Multer storage
const storage = multer.memoryStorage();
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
  // No-op for memory storage / base64
  return;
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
      let imageUrl = "";

      if (req.file) {
        // Convert buffer to base64 data URI
        const b64 = Buffer.from(req.file.buffer).toString("base64");
        let mime = req.file.mimetype;
        imageUrl = `data:${mime};base64,${b64}`;
      }

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
        // Convert buffer to base64 data URI
        const b64 = Buffer.from(req.file.buffer).toString("base64");
        let mime = req.file.mimetype;
        cat.imageUrl = `data:${mime};base64,${b64}`;
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
