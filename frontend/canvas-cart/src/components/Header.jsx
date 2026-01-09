// src/components/Header.jsx
import { FaHeart, FaShoppingCart, FaUser, FaPaintBrush } from "react-icons/fa";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";

const categories = [
  "Acrylic",
  "Oil Painting",
  "Watercolor",
  "Sketch",
  "Modern Art",
  "Traditional Art",
];

export default function Header() {
  const [showProfile, setShowProfile] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    image: "",
    price: "",
    category: "",
  });

  const profileRef = useRef(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    setIsAdmin(user?.email === "sruthirangaraj03@gmail.com");
  }, [user]);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setShowProfile(false);
    navigate("/");
  };

  const handleClickOutside = (e) => {
    if (profileRef.current && !profileRef.current.contains(e.target)) {
      setShowProfile(false);
    }
  };

  const handleInput = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "https://canvascart-backendd.onrender.com/api/products",
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.status === 200 || res.status === 201) {
        alert("✅ Product added successfully!");
        closeSellModal();
      } else {
        alert("Something went wrong!");
      }
    } catch (error) {
      console.error(error);
      alert("❌ Error adding product!");
    }
  };

  const closeSellModal = () => {
    setShowSellModal(false);
    setForm({ title: "", description: "", image: "", price: "", category: "" });
  };

  // Admin Header Layout
  if (isAdmin) {
    return (
      <>
        <div className="sticky top-0 z-50 bg-[#1e1e2f] text-white flex items-center justify-between px-8 h-[2.5cm] shadow-lg">
          <div className="text-2xl font-bold text-purple-400 flex items-center gap-2">
            <FaPaintBrush className="text-purple-300" />
            <span>CanvasCart Admin</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              className="hover:text-purple-400"
              onClick={() => navigate("/products")}
            >
              View Store
            </button>
            
            <button
              className="hover:text-purple-400"
              onClick={() => navigate("/admin")}
            >
              Dashboard
            </button>

            <button
              onClick={() => setShowSellModal(true)}
              className="bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded-lg transition"
            >
              Add Product
            </button>
            
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Admin Sell Modal */}
        {showSellModal && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[999] p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSellModal}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl border border-purple-200 w-full max-w-md overflow-hidden"
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Add New Product</h2>
                  <button
                    onClick={closeSellModal}
                    className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Form */}
              <div className="p-6">
                <form onSubmit={handleProductSubmit} className="space-y-4">
                  <input
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg"
                    placeholder="Product Title"
                    name="title"
                    value={form.title}
                    onChange={handleInput}
                    required
                  />
                  <textarea
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg resize-none"
                    placeholder="Description"
                    name="description"
                    value={form.description}
                    onChange={handleInput}
                    rows={3}
                  />
                  <input
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg"
                    placeholder="Image URL"
                    name="image"
                    value={form.image}
                    onChange={handleInput}
                  />
                  <div className="flex gap-3">
                    <input
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg"
                      placeholder="Price (₹)"
                      type="number"
                      name="price"
                      value={form.price}
                      onChange={handleInput}
                      required
                    />
                    <select
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg bg-white"
                      name="category"
                      value={form.category}
                      onChange={handleInput}
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <motion.button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Add Product
                  </motion.button>
                </form>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-purple-50 border-t border-purple-100">
                <button
                  onClick={closeSellModal}
                  className="w-full py-2 text-purple-600 hover:text-purple-700 font-medium hover:bg-purple-100 rounded"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </>
    );
  }

  // Regular User Header Layout
  return (
    <>
      <div className="sticky top-0 z-50 bg-[#1e1e2f] text-white flex items-center justify-between px-8 h-[2.5cm] shadow-lg">
        <div className="text-2xl font-bold text-purple-400 flex items-center gap-2">
          <FaPaintBrush className="text-purple-300" />
          <span>CanvasCart</span>
        </div>

        <div className="flex items-center gap-10">
          <button
            className="hover:text-purple-400"
            onClick={() => navigate("/products")}
          >
            Home
          </button>

          <FaHeart
            className="hover:text-red-400 cursor-pointer text-lg"
            onClick={() => navigate("/favorites")}
          />

          <FaShoppingCart
            className="hover:text-green-400 cursor-pointer text-lg"
            onClick={() => navigate("/cart")}
          />

          <div className="relative" ref={profileRef}>
            <FaUser
              className="hover:text-yellow-400 cursor-pointer text-lg"
              onClick={() => setShowProfile(!showProfile)}
            />
            {showProfile && (
              <div className="absolute right-0 mt-2 w-60 bg-white text-black rounded-lg shadow-lg p-4 z-50">
                <p className="font-semibold text-purple-800">{user?.name}</p>
                <p className="text-sm">{user?.email}</p>
                <p className="text-sm mb-3">{user?.phone}</p>
                <hr className="my-2" />
                <button
                  onClick={handleLogout}
                  className="flex justify-center text-red-600 hover:text-white hover:bg-red-500 transition px-4 py-1 rounded"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}