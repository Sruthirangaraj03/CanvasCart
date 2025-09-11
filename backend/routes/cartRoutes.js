const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddlewares");
const {
  addToCart,
  getCart,
  removeFromCart, updateQuantityInCart
} = require("../controllers/cartControllers");

// 🛒 Add to cart
router.post("/add", protect, addToCart);

// 📦 Get user cart
router.get("/", protect, getCart);

// ❌ Remove from cart
router.delete("/remove/:productId", protect, removeFromCart);

//inc or dec
router.patch("/update", protect, updateQuantityInCart);

module.exports = router;
