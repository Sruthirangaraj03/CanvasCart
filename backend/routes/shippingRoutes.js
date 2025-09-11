const express = require("express");
const router = express.Router();
const {
  addShippingDetails,
  getAllShippingDetails,
  deleteShippingDetails
} = require("../controllers/shippingControllers");

// Add new shipping details
router.post("/", addShippingDetails);

// Get all shipping records
router.get("/", getAllShippingDetails);

// Delete specific shipping entry
router.delete("/:id", deleteShippingDetails);

module.exports = router;
