const mongoose = require("mongoose");

const shippingDetailsSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email:    { type: String, required: true },
  phone:    { type: String, required: true },
  address:  { type: String, required: true },
  city:     { type: String, required: true },
  state:    { type: String, required: true },
  country:  { type: String, required: true },
  pincode:  { type: String, required: true },
}, {
  timestamps: true,
});

module.exports = mongoose.model("ShippingDetails", shippingDetailsSchema);
