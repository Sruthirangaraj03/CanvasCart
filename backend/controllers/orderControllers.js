const Order = require("../models/order");
const Cart = require("../models/cart");

exports.placeOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { shippingAddress, paymentIntentId } = req.body;

    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const products = cart.items.map(item => ({
      product: item.product._id,
      quantity: item.quantity
    }));

    const total = cart.totalPrice;

    const order = new Order({
      user: userId,
      products,
      total,
      shippingAddress,
      paymentIntentId,
      paymentStatus: "paid"
    });

    await order.save();

    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();

    res.status(201).json({ message: "Order placed successfully", order });
  } catch (err) {
    res.status(500).json({ message: "Order failed", error: err.message });
  }
};
