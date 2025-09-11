// src/components/SellModal.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";

const SellModal = ({ onClose, isAdmin }) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    image: "",
    price: "",
    category: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/products", form);
      alert("Product added successfully!");
      onClose();
    } catch (err) {
      alert("Something went wrong!");
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl border border-violet-200 w-full max-w-md overflow-hidden"
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 20 }}
        transition={{ type: "spring", duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-violet-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">
              {isAdmin ? "Add New Product" : "Access Denied"}
            </h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {isAdmin ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-violet-500 focus:outline-none transition-colors"
                  placeholder="Product Title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div>
                <textarea
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-violet-500 focus:outline-none transition-colors resize-none"
                  placeholder="Description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              <div>
                <input
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-violet-500 focus:outline-none transition-colors"
                  placeholder="Image URL"
                  name="image"
                  value={form.image}
                  onChange={handleChange}
                />
              </div>

              <div className="flex gap-3">
                <input
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-violet-500 focus:outline-none transition-colors"
                  placeholder="Price ($)"
                  type="number"
                  step="0.01"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  required
                />
                <input
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-violet-500 focus:outline-none transition-colors"
                  placeholder="Category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                />
              </div>

              <motion.button
                type="submit"
                className="w-full bg-gradient-to-r from-violet-600 to-violet-700 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Add Product
              </motion.button>
            </form>
          ) : (
            <div className="text-center py-8">
              <div className="mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Admin Access Required
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Only administrators can sell products. Please contact your admin for access.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full py-2 text-violet-600 hover:text-violet-700 font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SellModal;