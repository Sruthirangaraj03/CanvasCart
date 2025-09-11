const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddlewares");
const {
  addToFavorites,
  getFavorites,
  removeFromFavorites
} = require("../controllers/favoriteControllers");

// Add to favorites
router.post("/add", protect, addToFavorites);

// Get all favorites
router.get("/", protect, getFavorites);

// Remove from favorites
router.delete("/remove/:productId", protect, removeFromFavorites);

module.exports = router;
