// backend/models/payment.js

const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  // Razorpay payment identifiers
  razorpay_order_id: {
    type: String,
    required: true,
    index: true
  },
  razorpay_payment_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  razorpay_signature: {
    type: String,
    required: true
  },
  
  // Payment amount in paise (Razorpay format)
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Cart items with detailed product information
  cartItems: [{
    productId: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
    image: {
      type: String,
      default: null
    }
  }],
  
  // Comprehensive user details
  userDetails: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    username: {
      type: String,
      default: null
    },
    email: {
      type: String,
      default: null,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      default: null
    }
  },
  
  // Keep backward compatibility
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  
  // Detailed shipping information
  shippingDetails: {
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    pincode: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    country: {
      type: String,
      default: "India"
    }
  },
  
  // Payment status tracking
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'completed'
  },
  
  // Additional metadata
  paymentMethod: {
    type: String,
    default: 'razorpay'
  },
  
  currency: {
    type: String,
    default: 'INR'
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // This will automatically manage createdAt and updatedAt
});

// Indexes for better query performance
paymentSchema.index({ 'userDetails.userId': 1 });
paymentSchema.index({ 'userDetails.email': 1 });
paymentSchema.index({ paymentStatus: 1 });
paymentSchema.index({ createdAt: -1 });

// Virtual for total amount in rupees
paymentSchema.virtual('amountInRupees').get(function() {
  return this.amount / 100;
});

// Virtual for total items count
paymentSchema.virtual('totalItems').get(function() {
  return this.cartItems.reduce((total, item) => total + item.quantity, 0);
});

// Method to get formatted payment details
paymentSchema.methods.getFormattedDetails = function() {
  return {
    id: this._id,
    paymentId: this.razorpay_payment_id,
    orderId: this.razorpay_order_id,
    amount: this.amount / 100, // Convert to rupees
    currency: this.currency,
    status: this.paymentStatus,
    items: this.cartItems.map(item => ({
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      total: item.price * item.quantity
    })),
    customer: {
      name: this.userDetails.username || this.shippingDetails.fullName,
      email: this.userDetails.email,
      phone: this.userDetails.phone || this.shippingDetails.phone
    },
    shipping: this.shippingDetails,
    date: this.createdAt,
    totalItems: this.totalItems
  };
};

// Static method to find payments by user
paymentSchema.statics.findByUser = function(userId) {
  return this.find({
    $or: [
      { user: userId },
      { 'userDetails.userId': userId }
    ]
  }).sort({ createdAt: -1 });
};

// Static method to get payment statistics
paymentSchema.statics.getStats = function(startDate, endDate) {
  const matchCondition = {
    paymentStatus: 'completed'
  };
  
  if (startDate && endDate) {
    matchCondition.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  return this.aggregate([
    { $match: matchCondition },
    {
      $group: {
        _id: null,
        totalPayments: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        averageOrderValue: { $avg: '$amount' },
        totalItems: { $sum: { $size: '$cartItems' } }
      }
    },
    {
      $project: {
        _id: 0,
        totalPayments: 1,
        totalAmountInRupees: { $divide: ['$totalAmount', 100] },
        averageOrderValueInRupees: { $divide: ['$averageOrderValue', 100] },
        totalItems: 1
      }
    }
  ]);
};

// Pre-save middleware to update the updatedAt field
paymentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Ensure virtuals are included when converting to JSON
paymentSchema.set('toJSON', { virtuals: true });
paymentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("Payment", paymentSchema);