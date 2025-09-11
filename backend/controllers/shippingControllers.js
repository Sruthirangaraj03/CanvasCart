const ShippingDetails = require("../models/shipping");

// ➕ Add shipping details
exports.addShippingDetails = async (req, res) => {
  try {
    const newDetails = new ShippingDetails(req.body);
    const savedDetails = await newDetails.save();
    res.status(201).json(savedDetails);
  } catch (error) {
    res.status(400).json({ message: "Error saving shipping details", error });
  }
};

// 📄 Get all shipping details
exports.getAllShippingDetails = async (req, res) => {
  try {
    const details = await ShippingDetails.find().sort({ createdAt: -1 });
    res.status(200).json(details);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch details", error });
  }
};

// 🗑️ Delete shipping detail by ID
exports.deleteShippingDetails = async (req, res) => {
  try {
    await ShippingDetails.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Shipping details deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Deletion failed", error });
  }
};
