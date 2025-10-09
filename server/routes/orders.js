const express = require("express");
const mongoose = require("mongoose");
const { authRequired, requireRole } = require("../middleware/auth");
const Order = require("../models/Order");
const Product = require("../models/Product");

const router = express.Router();

// List orders: user sees own; admin sees all (or ?all=1)
router.get("/", authRequired, async (req, res) => {
  const isAdmin = req.user.role === "admin";
  const filter = isAdmin && req.query.all ? {} : { user: req.user.id };
  const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();
  return res.json(orders);
});

// Get by id: admin any; user own
router.get("/:id", authRequired, async (req, res) => {
  const id = req.params.id;
  if (!mongoose.isValidObjectId(id))
    return res.status(400).json({ error: "Invalid id" });
  const order = await Order.findById(id).lean();
  if (!order) return res.status(404).json({ error: "Order not found" });
  const isOwner = String(order.user) === String(req.user.id);
  if (!isOwner && req.user.role !== "admin")
    return res.status(403).json({ error: "Forbidden" });
  return res.json(order);
});

// Create order: compute total from product prices
router.post("/", authRequired, async (req, res) => {
  try {
    const { items } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Items are required" });
    }

    const productIds = items.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: productIds } }).lean();
    const map = new Map(products.map((p) => [String(p._id), p]));

    const normalizedItems = [];
    let total = 0;

    for (const item of items) {
      const p = map.get(String(item.productId));
      if (!p)
        return res
          .status(400)
          .json({ error: `Product not found: ${item.productId}` });
      const qty = Math.max(1, Number(item.quantity || 1));
      const priceAtPurchase = Number(p.price);
      total += priceAtPurchase * qty;
      normalizedItems.push({ product: p._id, quantity: qty, priceAtPurchase });
    }

    const order = await Order.create({
      user: req.user.id,
      items: normalizedItems,
      total,
      status: "pending",
    });

    return res.status(201).json(order);
  } catch (e) {
    console.error("Create order error:", e);
    return res.status(500).json({ error: "Failed to create order" });
  }
});

// Update order: admin only (e.g., status changes)
router.put("/:id", authRequired, requireRole("admin"), async (req, res) => {
  try {
    const updates = {};
    if (req.body.status) updates.status = req.body.status;
    // ...existing code...
    const updated = await Order.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });
    if (!updated) return res.status(404).json({ error: "Order not found" });
    return res.json(updated);
  } catch (e) {
    console.error("Update order error:", e);
    return res.status(500).json({ error: "Failed to update order" });
  }
});

module.exports = router;
