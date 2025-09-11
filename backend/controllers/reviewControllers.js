const Review = require("../models/review");
const Product = require("../models/product");
// ✏️ Update Review
exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { comment, stars } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized to update this review" });
    }

    review.comment = comment || review.comment;
    review.stars = stars || review.stars;

    await review.save();

    res.status(200).json({ message: "Review updated", review });
  } catch (error) {
    res.status(500).json({ message: "Failed to update review", error: error.message });
  }
};



// 📝 Add Review
exports.addReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { comment, stars } = req.body;

    const review = new Review({
      product: productId,
      user: req.user._id,
      comment,
      stars
    });

    await review.save();

    res.status(201).json({ message: "Review added", review });
  } catch (error) {
    res.status(500).json({ message: "Failed to add review", error: error.message });
  }
};

// 📥 Get All Reviews for a Product
exports.getReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ product: productId }).populate("user", "username");

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch reviews", error: error.message });
  }
};

// 🗑 Delete Review
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const review = await Review.findById(reviewId);

    if (!review) return res.status(404).json({ message: "Review not found" });

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await review.deleteOne();
    res.status(200).json({ message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete review", error: error.message });
  }
};

