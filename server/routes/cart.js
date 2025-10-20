const express = require("express");
const Cart = require("../models/Cart");

const router = express.Router();

function sanitizeItems(items) {
  if (!Array.isArray(items)) return [];
  const out = [];
  for (const it of items) {
    if (!it) continue;
    const productId = String(it.id ?? it.productId ?? "").trim();
    const name = String(it.name ?? "").trim();
    const price = Number(it.price ?? 0);
    const image = String(it.image ?? "");
    const qty = Math.max(1, Number(it.qty ?? 1));
    if (!productId || !name || isNaN(price)) continue;
    out.push({ productId, name, price, image, qty });
  }
  return out;
}

// Sync entire cart (create or update by userId or cartId)
router.post("/sync", async (req, res) => {
  try {
    const { cartId, userId } = req.body || {};
    const items = sanitizeItems((req.body || {}).items);

    let cart;

    // If userId provided, find or create cart by userId
    if (userId) {
      cart = await Cart.findOne({ userId });
      if (!cart) {
        cart = await Cart.create({ items, userId });
      } else {
        cart.items = items;
        await cart.save();
      }
    }
    // Otherwise use cartId
    else if (cartId) {
      cart = await Cart.findById(cartId);
      if (!cart) {
        cart = await Cart.create({ items, userId: null });
      } else {
        cart.items = items;
        await cart.save();
      }
    }
    // Create new anonymous cart
    else {
      cart = await Cart.create({ items, userId: null });
    }

    return res.json({
      cartId: cart._id.toString(),
      items: cart.items.map((it) => ({
        id: it.productId,
        name: it.name,
        price: it.price,
        image: it.image,
        qty: it.qty,
      })),
    });
  } catch (e) {
    console.error("Cart sync error:", e);
    return res.status(500).json({ error: "Failed to sync cart" });
  }
});

// Fetch cart by id
router.get("/:id", async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.id).lean();
    if (!cart) return res.status(404).json({ error: "Cart not found" });
    return res.json({
      cartId: cart._id.toString(),
      items: (cart.items || []).map((it) => ({
        id: it.productId,
        name: it.name,
        price: it.price,
        image: it.image,
        qty: it.qty,
      })),
    });
  } catch (e) {
    console.error("Get cart error:", e);
    return res.status(500).json({ error: "Failed to fetch cart" });
  }
});

// Fetch cart by userId
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: "userId required" });

    const cart = await Cart.findOne({ userId }).lean();
    if (!cart) {
      return res.json({ cartId: null, items: [] });
    }

    return res.json({
      cartId: cart._id.toString(),
      items: (cart.items || []).map((it) => ({
        id: it.productId,
        name: it.name,
        price: it.price,
        image: it.image,
        qty: it.qty,
      })),
    });
  } catch (e) {
    console.error("Get user cart error:", e);
    return res.status(500).json({ error: "Failed to fetch user cart" });
  }
});

module.exports = router;
