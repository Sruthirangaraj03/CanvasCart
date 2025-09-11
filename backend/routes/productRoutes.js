const express = require("express");
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct
} = require("../controllers/productControllers");

const { protect, isAdmin } = require("../middlewares/authMiddlewares");

// Product routes
router.get("/", getAllProducts);
router.get("/:id", getProductById);

router.post("/", protect, isAdmin, addProduct);
router.put("/:id", protect, isAdmin, updateProduct);
router.delete("/:id", protect, isAdmin, deleteProduct);

// Remove the review route - it's handled in reviewRoutes.js
// router.post("/reviews/:productId", protect, addReview); // REMOVE THIS LINE

module.exports = router;