// src/pages/Admin.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  FaPaintBrush, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaStore,
  FaChartBar,
  FaBoxOpen,
  FaUserShield
} from "react-icons/fa";
import axios from "axios";

const categories = [
  "Acrylic",
  "Oil Painting",
  "Watercolor",
  "Sketch",
  "Modern Art",
  "Traditional Art",
];

export default function Admin() {
  const [products, setProducts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState({
    title: "",
    description: "",
    image: "",
    price: "",
    category: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("token");

      // Check if user is admin
      if (!token || !user || user.email !== "sruthirangaraj03@gmail.com") {
        navigate("/", { replace: true });
        return;
      }

      // If authorized, fetch products
      await fetchProducts();
      setIsLoading(false);
    };

    checkAuthAndLoadData();
  }, [navigate]);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:8000/api/products", {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Handle both response formats
      setProducts(res.data.products || res.data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleInput = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:8000/api/products",
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
        closeAddModal();
        fetchProducts();
      }
    } catch (error) {
      console.error(error);
      alert("❌ Error adding product!");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `http://localhost:8000/api/products/${editingProduct._id}`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.status === 200) {
        alert("✅ Product updated successfully!");
        closeEditModal();
        fetchProducts();
      }
    } catch (error) {
      console.error(error);
      alert("❌ Error updating product!");
    }
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setForm({
      title: product.title,
      description: product.description,
      image: product.image,
      price: product.price,
      category: product.category,
    });
    setShowEditModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setForm({ title: "", description: "", image: "", price: "", category: "" });
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingProduct(null);
    setForm({ title: "", description: "", image: "", price: "", category: "" });
  };

  const deleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:8000/api/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert("✅ Product deleted successfully!");
        fetchProducts();
      } catch (error) {
        console.error(error);
        alert("❌ Error deleting product!");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100">
        <motion.div 
          className="flex flex-col items-center gap-6 bg-white p-8 rounded-2xl shadow-xl"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-500"></div>
            <FaPaintBrush className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-purple-500 text-xl" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Admin Dashboard</h3>
            <p className="text-gray-500">Please wait while we prepare your workspace...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      {/* Enhanced Admin Header */}
      <motion.div 
        className="sticky top-0 z-50 bg-gradient-to-r from-[#1e1e2f] via-[#2a2a3e] to-[#1e1e2f] text-white shadow-2xl border-b border-purple-500/20"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center h-20">
          <motion.div 
            className="flex items-center gap-4"
            whileHover={{ scale: 1.05 }}
          >
            <div className="p-2 bg-purple-500/20 rounded-xl">
              <FaPaintBrush className="text-purple-400 text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                CanvasCart Admin
              </h1>
              <p className="text-purple-300 text-sm">Dashboard</p>
            </div>
          </motion.div>
          
          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => navigate("/products")}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-all duration-300 border border-white/20"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaStore className="text-purple-300" />
              <span>Store</span>
            </motion.button>
            
            <motion.button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaPlus />
              <span>Add Product</span>
            </motion.button>
            
            <motion.button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500/90 hover:bg-red-600 rounded-lg transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Logout
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Main Content */}
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Welcome Section */}
          <motion.div 
            className="mb-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-4xl font-bold text-gray-800 mb-3">
              Welcome to Admin Dashboard
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Manage your art gallery with ease. Add, edit, and organize your beautiful artworks for customers to discover.
            </p>
          </motion.div>

          {/* Enhanced Stats Cards */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div 
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-100 group"
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors">
                  <FaBoxOpen className="text-purple-600 text-2xl" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-purple-600">{products.length}</p>
                  <p className="text-gray-500 text-sm">Items</p>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">Total Products</h3>
              <p className="text-gray-500 text-sm">Artworks in your gallery</p>
            </motion.div>

            <motion.div 
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-indigo-100 group"
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-indigo-100 rounded-xl group-hover:bg-indigo-200 transition-colors">
                  <FaChartBar className="text-indigo-600 text-2xl" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-indigo-600">{categories.length}</p>
                  <p className="text-gray-500 text-sm">Types</p>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">Categories</h3>
              <p className="text-gray-500 text-sm">Art categories available</p>
            </motion.div>

            <motion.div 
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100 group"
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-xl group-hover:bg-green-200 transition-colors">
                  <FaUserShield className="text-green-600 text-2xl" />
                </div>
                <div className="text-right">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mb-1 ml-auto"></div>
                  <p className="text-gray-500 text-sm">Online</p>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">Admin Status</h3>
              <p className="text-green-600 font-medium">Active & Secure</p>
            </motion.div>
          </motion.div>

          {/* Enhanced Products Management */}
          <motion.div 
            className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Products Management</h2>
                  <p className="text-purple-100">Manage your art collection</p>
                </div>
                <motion.button
                  onClick={() => setShowAddModal(true)}
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-xl flex items-center gap-2 border border-white/20"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaPlus />
                  Add New Product
                </motion.button>
              </div>
            </div>

            {/* Products Grid */}
            <div className="p-6">
              {products && products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product, index) => (
                    <motion.div
                      key={product._id}
                      className="group bg-gray-50 rounded-2xl p-5 hover:bg-white hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-purple-200"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -5 }}
                    >
                      <div className="relative overflow-hidden rounded-xl mb-4">
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-3 right-3">
                          <span className="bg-white/90 backdrop-blur-sm text-purple-600 px-3 py-1 rounded-full text-xs font-medium">
                            {product.category}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h3 className="font-bold text-gray-800 text-lg group-hover:text-purple-600 transition-colors">
                          {product.title}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-purple-600">₹{product.price}</span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2">
                          <motion.button 
                            onClick={() => openEditModal(product)}
                            className="flex-1 bg-orange-50 hover:bg-orange-100 text-orange-600 py-2 px-3 rounded-lg text-sm flex items-center justify-center gap-1 transition-colors"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <FaEdit /> Edit
                          </motion.button>
                          <motion.button 
                            onClick={() => deleteProduct(product._id)}
                            className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2 px-3 rounded-lg text-sm flex items-center justify-center gap-1 transition-colors"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <FaTrash /> Delete
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div 
                  className="text-center py-16"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="mb-6">
                    <FaBoxOpen className="text-6xl text-gray-300 mx-auto mb-4" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No Products Yet</h3>
                  <p className="text-gray-400 mb-6 max-w-md mx-auto">
                    Start building your art gallery by adding your first masterpiece!
                  </p>
                  <motion.button
                    onClick={() => setShowAddModal(true)}
                    className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-8 py-3 rounded-xl flex items-center gap-2 mx-auto"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaPlus />
                    Add Your First Product
                  </motion.button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Enhanced Add Product Modal */}
      {showAddModal && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[999] p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeAddModal}
        >
          <motion.div
            className="bg-white rounded-3xl shadow-2xl border border-purple-200 w-full max-w-lg overflow-hidden"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", duration: 0.4 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <FaPlus className="text-white text-lg" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Add New Artwork</h2>
                    <p className="text-purple-100 text-sm">Create a new product listing</p>
                  </div>
                </div>
                <motion.button
                  onClick={closeAddModal}
                  className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-xl"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
            </div>

            {/* Form */}
            <div className="p-8">
              <form onSubmit={handleProductSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Title</label>
                  <input
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                    placeholder="Enter artwork title..."
                    name="title"
                    value={form.title}
                    onChange={handleInput}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl resize-none focus:border-purple-500 focus:outline-none transition-colors"
                    placeholder="Describe your artwork..."
                    name="description"
                    value={form.description}
                    onChange={handleInput}
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                  <input
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                    placeholder="https://example.com/image.jpg"
                    name="image"
                    value={form.image}
                    onChange={handleInput}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹)</label>
                    <input
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                      placeholder="0"
                      type="number"
                      name="price"
                      value={form.price}
                      onChange={handleInput}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white focus:border-purple-500 focus:outline-none transition-colors"
                      name="category"
                      value={form.category}
                      onChange={handleInput}
                      required
                    >
                      <option value="">Choose category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Create Product
                </motion.button>
              </form>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
              <motion.button
                onClick={closeAddModal}
                className="w-full py-3 text-gray-600 hover:text-gray-800 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Enhanced Edit Product Modal */}
      {showEditModal && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[999] p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeEditModal}
        >
          <motion.div
            className="bg-white rounded-3xl shadow-2xl border border-purple-200 w-full max-w-lg overflow-hidden"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", duration: 0.4 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <FaEdit className="text-white text-lg" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Edit Artwork</h2>
                    <p className="text-orange-100 text-sm">Update product information</p>
                  </div>
                </div>
                <motion.button
                  onClick={closeEditModal}
                  className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-xl"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
            </div>

            {/* Form */}
            <div className="p-8">
              <form onSubmit={handleEditSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Title</label>
                  <input
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                    placeholder="Enter artwork title..."
                    name="title"
                    value={form.title}
                    onChange={handleInput}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl resize-none focus:border-orange-500 focus:outline-none transition-colors"
                    placeholder="Describe your artwork..."
                    name="description"
                    value={form.description}
                    onChange={handleInput}
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                  <input
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                    placeholder="https://example.com/image.jpg"
                    name="image"
                    value={form.image}
                    onChange={handleInput}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹)</label>
                    <input
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                      placeholder="0"
                      type="number"
                      name="price"
                      value={form.price}
                      onChange={handleInput}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white focus:border-orange-500 focus:outline-none transition-colors"
                      name="category"
                      value={form.category}
                      onChange={handleInput}
                      required
                    >
                      <option value="">Choose category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Update Product
                </motion.button>
              </form>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
              <motion.button
                onClick={closeEditModal}
                className="w-full py-3 text-gray-600 hover:text-gray-800 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}