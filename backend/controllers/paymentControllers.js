// backend/controllers/paymentControllers.js

const Razorpay = require("razorpay");
const crypto = require("crypto");
const Payment = require("../models/payment");
const User = require("../models/user"); // Assuming you have a User model

// Load environment variables
require("dotenv").config();

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

// Debug logs to ensure keys are loaded
console.log("🔑 Razorpay Key ID:", process.env.RAZORPAY_KEY_ID);
console.log("🔐 Razorpay Secret loaded:", !!process.env.RAZORPAY_SECRET);

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_SECRET) {
  console.error("❌ Razorpay keys are missing! Please check your .env file.");
}

// ================= Checkout =================
exports.checkout = async (req, res) => {
  const { amount } = req.body;

  if (!amount) {
    return res.status(400).json({ success: false, message: "Amount is required" });
  }

  const options = {
    amount: Number(amount), // Razorpay expects amount in paise
    currency: "INR",
    receipt: `receipt_order_${Date.now()}`,
  };

  try {
    const order = await razorpay.orders.create(options);
    console.log("✅ Razorpay order created:", order.id);
    res.status(200).json({ success: true, order });
  } catch (err) {
    console.error("❌ Razorpay Order Creation Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ================= Verify Payment =================
exports.verify = async (req, res) => {
  console.log("🔍 Payment verification request received");
  console.log("📋 Request body keys:", Object.keys(req.body));
  
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    cartItems = [],
    amount = 0,
    userDetails = {},
    shippingDetails = {},
  } = req.body;

  // Validate required payment details
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    console.log("❌ Missing required payment details");
    return res.status(400).json({ 
      success: false, 
      message: "Missing required payment details",
      missing: {
        order_id: !razorpay_order_id,
        payment_id: !razorpay_payment_id,
        signature: !razorpay_signature
      }
    });
  }

  const secret = process.env.RAZORPAY_SECRET;
  if (!secret) {
    console.log("❌ Razorpay secret not configured");
    return res.status(500).json({ 
      success: false, 
      message: "Payment verification configuration error" 
    });
  }

  try {
    // Generate expected signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body.toString())
      .digest("hex");

    console.log("🔐 Signature verification:", {
      expected: expectedSignature.substring(0, 10) + "...",
      received: razorpay_signature.substring(0, 10) + "...",
      match: expectedSignature === razorpay_signature
    });

    const isValid = expectedSignature === razorpay_signature;

    if (!isValid) {
      console.log("❌ Invalid payment signature");
      return res.status(400).json({ 
        success: false, 
        message: "Payment verification failed - invalid signature" 
      });
    }

    // Get user information from token if available
    let authenticatedUser = null;
    if (req.user && req.user._id) {
      try {
        authenticatedUser = await User.findById(req.user._id);
        console.log("👤 Authenticated user found:", authenticatedUser.email);
      } catch (userErr) {
        console.log("⚠️ Could not fetch authenticated user:", userErr.message);
      }
    }

    // Prepare comprehensive payment data
    const paymentData = {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount: Number(amount) || 0,
      cartItems: cartItems.map(item => ({
        productId: item.productId || item._id,
        name: item.name || item.title,
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 1,
        image: item.image || null,
      })),
      userDetails: {
        userId: userDetails.userId || (authenticatedUser ? authenticatedUser._id : null),
        username: userDetails.username || (authenticatedUser ? authenticatedUser.username : null),
        email: userDetails.email || (authenticatedUser ? authenticatedUser.email : null),
        phone: userDetails.phone || (authenticatedUser ? authenticatedUser.phone : null),
      },
      user: userDetails.userId || (authenticatedUser ? authenticatedUser._id : null),
      shippingDetails: {
        fullName: shippingDetails.fullName || "",
        address: shippingDetails.address || "",
        city: shippingDetails.city || "",
        state: shippingDetails.state || "",
        pincode: shippingDetails.pincode || "",
        phone: shippingDetails.phone || "",
      },
      paymentStatus: 'completed',
    };

    // Save payment to database
    const payment = await Payment.create(paymentData);

    console.log("✅ Payment saved successfully!");
    console.log("💰 Payment summary:", {
      id: payment._id,
      amount: payment.amount / 100, // Convert back to rupees for logging
      itemCount: payment.cartItems.length,
      customerEmail: payment.userDetails.email,
      customerName: payment.userDetails.username,
    });

    // Log cart items for debugging
    console.log("🛒 Cart items saved:", payment.cartItems.map(item => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price
    })));

    // Return success response with payment details
    res.status(200).json({ 
      success: true, 
      message: "Payment verified and saved successfully",
      payment: {
        id: payment._id,
        razorpay_payment_id: payment.razorpay_payment_id,
        razorpay_order_id: payment.razorpay_order_id,
        amount: payment.amount,
        status: payment.paymentStatus,
        cartItems: payment.cartItems,
        userDetails: payment.userDetails,
        shippingDetails: payment.shippingDetails,
        createdAt: payment.createdAt,
      }
    });

  } catch (err) {
    console.error("💥 Payment verification error:", err);
    console.error("📍 Error stack:", err.stack);
    
    // Return detailed error for debugging
    res.status(500).json({ 
      success: false, 
      message: "Payment verification failed due to server error",
      error: process.env.NODE_ENV === 'development' ? err.message : "Internal server error",
      details: process.env.NODE_ENV === 'development' ? {
        stack: err.stack,
        received_data: {
          cartItemsCount: req.body.cartItems?.length || 0,
          userDetailsPresent: !!req.body.userDetails,
          shippingDetailsPresent: !!req.body.shippingDetails,
        }
      } : undefined
    });
  }
};

// ================= Get Payment Details =================
exports.getPaymentById = async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    const payment = await Payment.findById(paymentId);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    res.status(200).json({
      success: true,
      payment: payment
    });

  } catch (err) {
    console.error("Error fetching payment:", err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// ================= Get User Payments =================
exports.getUserPayments = async (req, res) => {
  try {
    const userId = req.user._id; // From auth middleware
    
    const payments = await Payment.find({
      $or: [
        { user: userId },
        { "userDetails.userId": userId }
      ]
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      payments: payments
    });

  } catch (err) {
    console.error("Error fetching user payments:", err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};