import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { FaHeart, FaShoppingCart } from "react-icons/fa";

export default function Products() {
  // Helper function to get user ID
  const getUserId = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user.id || user._id || "anonymous";
  };

  const [products, setProducts] = useState([]);
  const [favorites, setFavorites] = useState(() => {
    const userId = getUserId();
    const stored = localStorage.getItem(`favorites_${userId}`);
    return stored ? JSON.parse(stored) : [];
  });
  const [cart, setCart] = useState(() => {
    const userId = getUserId();
    const stored = localStorage.getItem(`cart_${userId}`);
    return stored ? JSON.parse(stored) : [];
  });
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [priceFilter, setPriceFilter] = useState("");
  const [toast, setToast] = useState("");

  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      const res = await axios.get("https://canvascart-backendd.onrender.com/api/products");
      setProducts(res.data.products || []);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddToFavorites = (product) => {
    const isAlreadyFav = favorites.some((fav) => fav._id === product._id);
    let updated;

    if (!isAlreadyFav) {
      updated = [...favorites, product];
      setToast("Added to favorites ❤️");
    } else {
      updated = favorites.filter((fav) => fav._id !== product._id);
      setToast("Removed from favorites");
    }

    setFavorites(updated);
    
    // Store with user-specific key
    const userId = getUserId();
    localStorage.setItem(`favorites_${userId}`, JSON.stringify(updated));
    
    setTimeout(() => setToast(""), 2000);
    
    // Stay on current page - no navigation
  };

  const handleAddToCart = (product) => {
    const alreadyInCart = cart.some((item) => item._id === product._id);
    let updatedCart;

    if (!alreadyInCart) {
      updatedCart = [...cart, { ...product, quantity: 1 }];
      setToast("Added to cart 🛒");
    } else {
      updatedCart = cart.map((item) =>
        item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
      );
      setToast("Quantity updated in cart");
    }

    setCart(updatedCart);
    
    // Store with user-specific key
    const userId = getUserId();
    localStorage.setItem(`cart_${userId}`, JSON.stringify(updatedCart));
    
    setTimeout(() => setToast(""), 2000);
    navigate("/cart");
  };

  const artTypes = [
    "All",
    "Acrylic",
    "Modern Art",
    "Watercolor",
    "Oil Painting",
    "Sketch",
    "Traditional Art",
    "Digital Art",
    "Pop Art",
    "Impressionism",
    "Fantasy",
  ];

  const priceMatch = (price) => {
    if (!priceFilter) return true;
    if (priceFilter === "low") return true;
    if (priceFilter === "high") return true;

    const [min, max] = priceFilter.split("-");
    if (max) return price >= +min && price <= +max;
    return price >= +min;
  };

  let filteredProducts = products.filter((product) => {
    const matchSearch = product.title.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === "All" || product.category === category;
    const matchPrice = priceMatch(product.price);
    return matchSearch && matchCategory && matchPrice;
  });

  if (priceFilter === "low") {
    filteredProducts = filteredProducts.sort((a, b) => a.price - b.price);
  } else if (priceFilter === "high") {
    filteredProducts = filteredProducts.sort((a, b) => b.price - a.price);
  }

  return (
    <div className="px-6 py-10">
      
      {/* 🔍 Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="bg-violet-50 border border-violet-200 rounded-xl px-4 py-2 shadow-sm flex items-center scale-[1.03]">
          <input
            type="text"
            placeholder="Search by title..."
            className="w-full bg-transparent text-sm text-black placeholder-black focus:outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="bg-violet-50 border border-violet-200 rounded-xl px-4 py-2 shadow-sm scale-[1.03]">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-transparent text-sm text-black focus:outline-none"
          >
            {artTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-violet-50 border border-violet-200 rounded-xl px-4 py-2 shadow-sm scale-[1.03]">
          <select
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value)}
            className="w-full bg-transparent text-sm text-black focus:outline-none"
          >
            <option value="">Sort / Filter Price</option>
            <option value="low">Low to High</option>
            <option value="high">High to Low</option>
            <option value="0-999">₹0 – ₹999</option>
            <option value="1000-2000">₹1000 – ₹2000</option>
            <option value="2000-5000">₹2000 – ₹5000</option>
            <option value="5000">₹5000+</option>
          </select>
        </div>
      </div>

      {/* ✅ Toast */}
      {toast && (
        <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 bg-violet-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {toast}
        </div>
      )}

      {/* 🖼️ Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <motion.div
              key={product._id}
              whileHover={{ scale: 1.03 }}
              className="relative rounded-2xl overflow-hidden shadow-lg bg-white group transition-all"
            >
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-72 object-cover cursor-pointer"
                onClick={() => navigate(`/products/${product._id}`)}
              />

              <div className="absolute top-3 right-3">
                <FaHeart
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToFavorites(product);
                  }}
                  className={`${
                    favorites.some((fav) => fav._id === product._id)
                      ? "text-pink-600"
                      : "text-gray-300"
                  } bg-white rounded-full p-2 text-2xl shadow-md hover:text-pink-500 transition cursor-pointer`}
                />
              </div>

              <div className="p-4">
                <h2 className="text-lg font-bold text-gray-800">{product.title}</h2>
                <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
              </div>

              <div className="flex justify-between items-center px-4 pb-4">
                <p className="text-violet-600 font-bold text-lg">₹{product.price}</p>
              </div>
            </motion.div>
          ))
        ) : (
          <p className="col-span-3 text-center text-gray-500">No products found.</p>
        )}
      </div>
    </div>
  );
}