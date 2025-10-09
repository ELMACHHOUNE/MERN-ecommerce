const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    images: [{ type: String }],
    stock: { type: Number, default: 0, min: 0 },
    category: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
