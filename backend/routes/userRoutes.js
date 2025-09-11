const express = require("express");
const router = express.Router();
const { protect, isAdmin } = require("../middlewares/authMiddlewares");
const {
  getUserProfile,
  updateUserProfile,
  getAllUsers,updateUserRole
} = require("../controllers/userControllers");

// User Routes
router.get("/fetch", protect, getUserProfile);
router.put("/update", protect, updateUserProfile);

// Admin Route
router.get("/all", protect, isAdmin, getAllUsers);
router.put("/update-role", protect, updateUserRole);
module.exports = router;
