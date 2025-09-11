const Favorite = require("../models/favorite");

// ➕ Add to favorites
exports.addToFavorites = async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.body;

  try {
    let favorite = await Favorite.findOne({ user: userId });

    if (!favorite) {
      favorite = new Favorite({ user: userId, products: [] });
    }

    if (!favorite.products.includes(productId)) {
      favorite.products.push(productId);
      await favorite.save();
    }

    res.status(200).json({ message: "Added to favorites", favorite });
  } catch (err) {
    res.status(500).json({ message: "Failed to add to favorites", error: err.message });
  }
};

// 📦 Get all favorites
exports.getFavorites = async (req, res) => {
  try {
    const favorite = await Favorite.findOne({ user: req.user._id }).populate("products");
    res.status(200).json(favorite || { products: [] });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch favorites", error: err.message });
  }
};

// ❌ Remove from favorites
exports.removeFromFavorites = async (req, res) => {
  const { productId } = req.params;

  try {
    const favorite = await Favorite.findOne({ user: req.user._id });

    if (favorite) {
      favorite.products = favorite.products.filter(
        (id) => id.toString() !== productId
      );
      await favorite.save();
    }

    res.status(200).json({ message: "Removed from favorites", favorite });
  } catch (err) {
    res.status(500).json({ message: "Failed to remove from favorites", error: err.message });
  }
};
