const mongoose = require("mongoose");
const Cart = require("../models/cart");
const Product = require("../models/product");

// ➕ Add to Cart (with validation + totalPrice)
exports.addToCart = async (req, res) => {
  const userId = req.user._id;
  const { productId, quantity } = req.body;

  try {
    // 1️⃣ Validate productId format
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid or missing product ID" });
    }

    // 2️⃣ Fetch product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // 3️⃣ Find or create user's cart
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [], totalPrice: 0 });
    }

    // 4️⃣ Add or update item in cart
    const existingItem = cart.items.find(
      item => item.product && item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity || 1;
    } else {
      cart.items.push({
        product: product._id,
        quantity: quantity || 1
      });
    }

    // 5️⃣ Recalculate totalPrice
    let totalPrice = 0;
    for (const item of cart.items) {
      if (!item.product) continue;
      const p = await Product.findById(item.product);
      if (!p) continue;

      totalPrice += p.price * item.quantity;
    }

    cart.totalPrice = totalPrice;

    // 6️⃣ Save and respond
    await cart.save();

    res.status(200).json({
      message: "Item added to cart",
      cart
    });

  } catch (err) {
    console.error("❌ Error adding to cart:", err);
    res.status(500).json({ message: "Add to cart failed", error: err.message });
  }
};


// 📦 Get User Cart
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    if (!cart) return res.status(200).json({ items: [] });
    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ message: "Get cart failed", error: err.message });
  }
};
// inc or dec

exports.updateQuantityInCart = async (req, res) => {
  const userId = req.user._id;
  const { productId, type } = req.body; // type = "inc" or "dec"

  try {
    const cart = await Cart.findOne({ user: userId });

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find(item => item.product.toString() === productId);

    if (!item) return res.status(404).json({ message: "Product not found in cart" });

    // 🔼 Increase
    if (type === "inc") {
      item.quantity += 1;
    }

    // 🔽 Decrease (but don't let it go below 1)
    else if (type === "dec") {
      item.quantity = Math.max(item.quantity - 1, 1);
    }

    // ✅ Recalculate total price
    let total = 0;
    for (let i of cart.items) {
      const product = await Product.findById(i.product);
      if (product) total += product.price * i.quantity;
    }

    cart.totalPrice = total;
    await cart.save();

    res.status(200).json({ message: "Cart updated", cart });
  } catch (err) {
    res.status(500).json({ message: "Update cart failed", error: err.message });
  }
};

// ❌ Remove Item
exports.removeFromCart = async (req, res) => {
  const productId = req.params.productId;

  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(item => item.product.toString() !== productId);

    await cart.save();
    res.status(200).json({ message: "Item removed from cart", cart });
  } catch (err) {
    res.status(500).json({ message: "Remove from cart failed", error: err.message });
  }
};
