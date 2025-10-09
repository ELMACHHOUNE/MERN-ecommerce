const express = require("express");
const { authRequired, requireRole } = require("../middleware/auth");
const Product = require("../models/Product");

const router = express.Router();

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
router.post("/", authRequired, requireRole("admin"), async (req, res) => {
  try {
    const { title, description, price, images, stock, category } =
      req.body || {};
    if (!title || price == null)
      return res.status(400).json({ error: "Title and price are required" });
    const created = await Product.create({
      title,
      description,
      price,
      images: images || [],
      stock: stock || 0,
      category,
    });
    return res.status(201).json(created);
  } catch (e) {
    console.error("Create product error:", e);
    return res.status(500).json({ error: "Failed to create product" });
  }
});

router.put("/:id", authRequired, requireRole("admin"), async (req, res) => {
  try {
    const updates = req.body || {};
    updates.updatedAt = new Date();
    const updated = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });
    if (!updated) return res.status(404).json({ error: "Product not found" });
    return res.json(updated);
  } catch (e) {
    console.error("Update product error:", e);
    return res.status(500).json({ error: "Failed to update product" });
  }
});

router.delete("/:id", authRequired, requireRole("admin"), async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Product not found" });
    return res.json({ success: true });
  } catch (e) {
    console.error("Delete product error:", e);
    return res.status(500).json({ error: "Failed to delete product" });
  }
});

module.exports = router;
