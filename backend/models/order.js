const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
  amount: {
    type: Number,
    required: true,
  },
  paymentId: String,
  orderId: String,
  status: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending",
  },
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
