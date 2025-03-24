const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema({
  weight: { type: String, required: true },
  mrp: { type: Number, required: true },
  discount: { type: Number, default: 0 }, // Discount in percentage
  price: { type: Number }, // Price will be set in middleware
  images: [{ type: String, required: true }],
  stock: { type: Number, required: true, default: 0 },
  isAvailable: { type: Boolean, default: true }
});

// Middleware to calculate `price` before saving variant
variantSchema.pre("save", function (next) {
  if (this.mrp && this.discount) {
    this.price = Math.round(this.mrp - (this.mrp * this.discount) / 100);
  } else {
    this.price = this.mrp || 0;
  }
  next();
});
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    images: [{ type: String, required: true }],
    mrp: { type: Number, required: true },
    discount: { type: Number, default: 0 }, // Discount in percentage
    price: { type: Number }, // Price will be set in middleware
    variants: [variantSchema], // Array of variant objects
    stock: { type: Number, required: true, default: 0 },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" }
  },
  { timestamps: true }
);

// Middleware to calculate `price` before saving product
productSchema.pre("save", function (next) {
  if (this.mrp && this.discount) {
    this.price = Math.round(this.mrp - (this.mrp * this.discount) / 100);
  } else {
    this.price = this.mrp || 0;
  }
  this.updatedAt = Date.now(); // Ensure updatedAt is set
  next();
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
