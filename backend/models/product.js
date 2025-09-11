// models/Product.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  image: String,
  price: { type: Number, required: true },
  category: String, // Eg: "Landscape", "Portrait"
  artType: String,  // Eg: "Acrylic", "Watercolor", "Oil"
  rating: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
