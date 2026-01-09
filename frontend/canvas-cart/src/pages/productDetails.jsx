import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { FaStar } from "react-icons/fa";

export default function Details() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("Product ID from useParams:", id); // Debug log
    
    if (!id) {
      console.warn("Product ID is undefined");
      setError("Product ID is missing");
      setLoading(false);
      return;
    }

    fetchProduct();
    fetchReviews();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching product with ID:", id); // Debug log
      
      const res = await axios.get(`https://canvascart-backendd.onrender.com/api/products/${id}`);
      setProduct(res.data);
    } catch (err) {
      console.error("Failed to fetch product:", err.response?.data || err.message);
      setError("Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      console.log("Fetching reviews for product ID:", id); // Debug log

      const res = await axios.get(`https://canvascart-backendd.onrender.com/api/reviews/product/${id}`);
      setReviews(res.data);
    } catch (err) {
      console.error("Failed to fetch reviews:", err.response?.data || err.message);
      // Don't set error for reviews failure, just log it
    }
  };

  const handleReviewSubmit = async () => {
    if (!comment || rating === 0) return;

    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    };

    try {
      if (editingId) {
        await axios.put(
          `https://canvascart-backendd.onrender.com/api/reviews/${editingId}`,
          { comment, stars: rating },
          config
        );
      } else {
        await axios.post(
          `https://canvascart-backendd.onrender.com/api/reviews/${id}`,
          { comment, stars: rating },
          config
        );
      }

      setComment("");
      setRating(0);
      setEditingId(null);
      fetchReviews();
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review");
    }
  };

  const handleEdit = (review) => {
    setComment(review.comment);
    setRating(review.stars);
    setEditingId(review._id);
  };

  const handleDelete = async (reviewId) => {
    try {
      await axios.delete(`https://canvascart-backendd.onrender.com/api/reviews/${reviewId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      fetchReviews();
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Failed to delete review");
    }
  };

  const handleAddToCart = async () => {
    try {
      await axios.post(
        "https://canvascart-backendd.onrender.com/api/cart/add",
        { productId: product._id, quantity: quantity }, // Use the quantity state
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      navigate("/cart");
    } catch (error) {
      console.error("Error adding to cart", error);
      alert("Failed to add to cart");
    }
  };

  const handleAddToFavorites = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login to add to favorites");
        return;
      }

      await axios.post(
        "https://canvascart-backendd.onrender.com/api/favorites/add",
        { productId: product._id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      alert("Added to favorites!");
      // Optionally navigate to favorites page after adding
      // navigate("/favorites");
    } catch (error) {
      console.error("Error adding to favorites:", error);
      if (error.response?.status === 400) {
        alert("Product already in favorites!");
      } else {
        alert("Failed to add to favorites");
      }
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="pt-[2.5cm] text-center text-gray-500">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto"></div>
        <p className="mt-4">Loading product...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="pt-[2.5cm] text-center text-red-500">
        <p>{error}</p>
        <button 
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Show not found state
  if (!product) {
    return (
      <div className="pt-[2.5cm] text-center text-gray-500">
        <p>Product not found</p>
        <button 
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="pt-[2cm] px-6 pb-20 min-h-screen bg-gray-50">
      <div className="flex flex-col md:flex-row items-center justify-center gap-14">
        {/* Image */}
        <div className="w-full md:w-1/2 flex justify-center">
          <img
            src={product.image}
            alt={product.title}
            className="w-[320px] rounded-2xl shadow-xl hover:scale-105 transition-all duration-300"
            onError={(e) => {
              e.target.src = '/placeholder-image.jpg'; // Fallback image
            }}
          />
        </div>

        {/* Product Info */}
        <div className="w-full md:w-1/2 text-center md:text-left">
          <h1 className="text-4xl font-bold text-black">{product.title}</h1>
          <p className="text-gray-600 mt-3 text-lg">{product.description}</p>
          <p className="text-2xl font-bold text-green-600 mt-4">₹{product.price}</p>

          {/* Quantity + Buttons */}
          <div className="flex items-center justify-center md:justify-start gap-4 mt-6">
            <div className="flex items-center border rounded-full px-3 py-2 shadow-md">
              <button
                className="text-lg text-gray-600 px-2"
                onClick={() => setQuantity(quantity > 1 ? quantity - 1 : 1)}
              >
                −
              </button>
              <span className="px-2 text-lg">{quantity}</span>
              <button
                className="text-lg text-gray-600 px-2"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              className="bg-purple-800 text-white px-9 py-5 rounded-full text-sm hover:bg-purple-700 transition duration-300 shadow-md"
            >
              ADD TO CART
            </button>

            {/* Heart button adds to favorites */}
            <button
              onClick={handleAddToFavorites}
              className="bg-white border border-gray-300 p-3 rounded-full hover:bg-pink-100 transition duration-300 shadow-sm"
            >
              ❤️
            </button>
          </div>

          <p className="text-sm text-gray-400 mt-4">
            Loved it? <strong>Cart it</strong>. 📦
          </p>
        </div>
      </div>

      {/* ✨ Reviews Section */}
      <div className="mt-20 w-full">
        <h2 className="text-3xl font-semibold text-center text-black mb-6">✨ Customer Reviews</h2>

        {/* Review Input */}
        <div className="max-w-3xl mx-auto mb-10">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write your review..."
            className="w-full bg-gray-100 p-3 rounded-lg outline-none focus:ring-2 focus:ring-purple-400"
          />

          {/* Stars */}
          <div className="flex items-center gap-1 mt-2 mb-4">
            {[...Array(5)].map((_, index) => {
              const currentRating = index + 1;
              return (
                <label key={index}>
                  <input
                    type="radio"
                    name="rating"
                    value={currentRating}
                    onClick={() => setRating(currentRating)}
                    className="hidden"
                  />
                  <FaStar
                    className="cursor-pointer transition-transform transform hover:scale-110"
                    size={24}
                    color={currentRating <= (hover || rating) ? "#facc15" : "#d1d5db"}
                    onMouseEnter={() => setHover(currentRating)}
                    onMouseLeave={() => setHover(null)}
                  />
                </label>
              );
            })}
          </div>

          <button
            onClick={handleReviewSubmit}
            className="px-6 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition duration-300"
          >
            {editingId ? "Update Review" : "Post Review"}
          </button>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <motion.div
                key={review._id}
                whileHover={{ scale: 1.03 }}
                className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 min-h-[180px] transition-all hover:shadow-purple-300 hover:border-purple-400"
              >
                <div className="flex mb-2">
                  {[...Array(review.stars)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400 mr-1" />
                  ))}
                </div>
                <p className="text-gray-800 font-medium">{review.comment}</p>
                <p className="text-sm text-gray-500 mt-2">— {review?.user?.username || "Anonymous"}</p>
                <div className="flex gap-4 mt-3 text-sm">
                  <button
                    onClick={() => handleEdit(review)}
                    className="text-blue-500 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(review._id)}
                    className="text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <p className="text-center text-gray-400 col-span-3">
              No reviews yet. Be the first to write one!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}