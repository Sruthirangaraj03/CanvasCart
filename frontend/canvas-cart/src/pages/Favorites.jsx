// src/pages/Favorites.jsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Helper function to get user ID
  const getUserId = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user.id || user._id || "anonymous";
  };

  useEffect(() => {
    const fetchFavorites = async () => {
      const userId = getUserId();
      
      // First try user-specific localStorage (from Products page)
      const localFavorites = localStorage.getItem(`favorites_${userId}`);
      if (localFavorites) {
        setFavorites(JSON.parse(localFavorites));
        setLoading(false);
        return;
      }

      // Fallback to API if needed
      const token = localStorage.getItem("token");
      if (!token) return setLoading(false);

      try {
        const res = await fetch("https://canvascart-backendd.onrender.com/api/favorites", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setFavorites(data.products || []);
      } catch {
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen px-6 py-8 bg-gradient-to-b from-[#f8f9ff] to-white"
    >
      <motion.h1
        className="text-4xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 mb-4"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7 }}
      >
        Your Handpicked Treasures ✨
      </motion.h1>

      {loading ? (
        <p className="text-center text-gray-500 mt-10">Loading...</p>
      ) : favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mt-10">
          {favorites.map((product) => (
            <motion.div
              key={product._id}
              whileHover={{ scale: 1.04, rotate: 0.5 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(`/products/${product._id}`)}
              className="bg-white rounded-2xl shadow-lg cursor-pointer hover:shadow-xl transition-all overflow-hidden"
            >
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="p-5 text-center">
                <h2 className="text-xl font-bold text-gray-800">{product.title}</h2>
                <p className="text-purple-600 font-semibold mt-1 text-lg">
                  ₹{product.price}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          className="text-center mt-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-xl text-gray-500">No favorites added yet.</p>
          <motion.button
            className="mt-6 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-semibold shadow-md hover:scale-105 transition-all"
            onClick={() => navigate("/products")}
            whileTap={{ scale: 0.95 }}
          >
            Explore Products
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
}