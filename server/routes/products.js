const express = require("express");
const { authRequired, requireRole } = require("../middleware/auth");
const Product = require("../models/Product");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const router = express.Router();

// uploads config
const UPLOAD_DIR = path.join(__dirname, "..", "uploads", "products");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || "";
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  },
});
const fileFilter = (_req, file, cb) => {
  if (/^image\//.test(file.mimetype)) return cb(null, true);
  cb(new Error("Only image files are allowed"));
};
const upload = multer({ storage, fileFilter });

// serve static images at /api/products/images/*
router.use("/images", express.static(UPLOAD_DIR));

// Public: list and get one
router.get("/", async (_req, res) => {
  const products = await Product.find().sort({ createdAt: -1 }).lean();
  return res.json(products);
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

      const imageUrls = files.map((f) => `/api/products/images/${f.filename}`);

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
        // delete old files
        for (const url of existing.images || []) {
          const filename = path.basename(url || "");
          if (!filename) continue;
          const fp = path.join(UPLOAD_DIR, filename);
          fs.promises.unlink(fp).catch(() => {});
        }
        updates.images = files.map((f) => `/api/products/images/${f.filename}`);
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

    // delete files
    for (const url of existing.images || []) {
      const filename = path.basename(url || "");
      if (!filename) continue;
      const fp = path.join(UPLOAD_DIR, filename);
      fs.promises.unlink(fp).catch(() => {});
    }

    await Product.findByIdAndDelete(req.params.id);
    return res.json({ success: true });
  } catch (e) {
    console.error("Delete product error:", e);
    return res.status(500).json({ error: "Failed to delete product" });
  }
});

module.exports = router;
