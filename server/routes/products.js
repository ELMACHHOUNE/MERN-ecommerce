const express = require("express");
const { authRequired, requireRole } = require("../middleware/auth");
const Product = require("../models/Product");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const mongoose = require("mongoose");

const router = express.Router();

// uploads config
const UPLOAD_DIR = path.join(__dirname, "..", "uploads", "products");
try {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
} catch (error) {
  console.log(
    "Warning: Could not create upload directory (expected in read-only environments like Vercel). Uploads may fail."
  );
}

const storage = multer.memoryStorage();
const fileFilter = (_req, file, cb) => {
  if (/^image\//.test(file.mimetype)) return cb(null, true);
  cb(new Error("Only image files are allowed"));
};
const upload = multer({ storage, fileFilter });

// serve static images at /api/products/images/*
// router.use("/images", express.static(UPLOAD_DIR));

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Public: list and get one
router.get("/", async (req, res) => {
  try {
    let baseFilter = {};

    const { category, categoryName } = req.query || {};
    if (category || categoryName) {
      const or = [];

      if (category) {
        const catStr = String(category);
        const isObjectId = mongoose.Types.ObjectId.isValid(catStr);
        if (isObjectId) {
          const catId = new mongoose.Types.ObjectId(catStr);
          or.push({ category: catId });
          or.push({ categoryId: catId });
          or.push({ "category._id": catId });
        }
        or.push({ category: catStr });
        or.push({ categoryId: catStr });
        or.push({ "category.id": catStr });
      }

      if (categoryName) {
        const rx = new RegExp(`^${escapeRegex(String(categoryName))}$`, "i");
        or.push({ categoryName: rx });
        or.push({ "category.name": rx });
        or.push({ category: rx });
      }

      if (or.length) {
        baseFilter = { $and: [baseFilter, { $or: or }] };
      }
    }

    const products = await Product.find(baseFilter)
      .sort({ createdAt: -1 })
      .lean();
    return res.json(products);
  } catch (e) {
    console.error("List products error:", e);
    return res.status(500).json({ error: "Failed to load products" });
  }
});

// List distinct categories from DB
router.get("/categories", async (_req, res) => {
  try {
    const cats = await Product.distinct("category", {
      category: { $nin: [null, "", undefined] },
    });
    return res.json(cats.sort());
  } catch (e) {
    console.error("Fetch categories error:", e);
    return res.status(500).json({ error: "Failed to load categories" });
  }
});

router.get("/:id", async (req, res) => {
  const prod = await Product.findById(req.params.id).lean();
  if (!prod) return res.status(404).json({ error: "Product not found" });
  return res.json(prod);
});

// Admin: create/update/delete
router.post(
  "/",
  authRequired,
  requireRole("admin"),
  upload.array("images", 5),
  async (req, res) => {
    try {
      const { title, description, price, stock, category } = req.body || {};
      if (!title || price == null)
        return res.status(400).json({ error: "Title and price are required" });

      const files = req.files || [];
      if (files.length < 1)
        return res.status(400).json({ error: "At least 1 image is required" });

      const imageUrls = files.map((f) => {
        const b64 = Buffer.from(f.buffer).toString("base64");
        const mime = f.mimetype;
        return `data:${mime};base64,${b64}`;
      });

      const created = await Product.create({
        title,
        description,
        price: Number(price),
        images: imageUrls,
        stock: stock != null ? Number(stock) : 0,
        category,
      });
      return res.status(201).json(created);
    } catch (e) {
      console.error("Create product error:", e);
      return res.status(500).json({ error: "Failed to create product" });
    }
  }
);

router.put(
  "/:id",
  authRequired,
  requireRole("admin"),
  upload.array("images", 5),
  async (req, res) => {
    try {
      const existing = await Product.findById(req.params.id);
      if (!existing)
        return res.status(404).json({ error: "Product not found" });

      const files = req.files || [];
      const updates = { ...(req.body || {}), updatedAt: new Date() };

      // cast numeric fields coming from multipart
      if (updates.price != null) updates.price = Number(updates.price);
      if (updates.stock != null) updates.stock = Number(updates.stock);

      // replace images if new ones uploaded
      if (files.length > 0) {
        updates.images = files.map((f) => {
          const b64 = Buffer.from(f.buffer).toString("base64");
          const mime = f.mimetype;
          return `data:${mime};base64,${b64}`;
        });
      }

      const updated = await Product.findByIdAndUpdate(req.params.id, updates, {
        new: true,
      });
      if (!updated) return res.status(404).json({ error: "Product not found" });
      return res.json(updated);
    } catch (e) {
      console.error("Update product error:", e);
      return res.status(500).json({ error: "Failed to update product" });
    }
  }
);

router.delete("/:id", authRequired, requireRole("admin"), async (req, res) => {
  try {
    const existing = await Product.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: "Product not found" });

    // No file deletion needed for base64
    await Product.findByIdAndDelete(req.params.id);
    return res.json({ success: true });
  } catch (e) {
    console.error("Delete product error:", e);
    return res.status(500).json({ error: "Failed to delete product" });
  }
});

module.exports = router;
