const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddlewares");
const {
  addReview,
  getReviewsByProduct,
  deleteReview,updateReview
} = require("../controllers/reviewControllers");

router.post("/:productId", protect, addReview);
router.get("/product/:productId", getReviewsByProduct);
router.put("/:reviewId", protect, updateReview); // Update review endpoint
// DELETE /api/reviews/:reviewId - delete review
router.delete("/:reviewId", protect, deleteReview);

module.exports = router;
