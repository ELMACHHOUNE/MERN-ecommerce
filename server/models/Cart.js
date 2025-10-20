const mongoose = require("mongoose");

const CartItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, default: "" },
    qty: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const CartSchema = new mongoose.Schema(
  {
    items: { type: [CartItemSchema], default: [] },
    userId: { type: String, default: null, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", CartSchema);
