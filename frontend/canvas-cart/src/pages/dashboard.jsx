// src/pages/Dashboard.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import dashboard from "../assets/images/dashbordbg.jpg";
import AnimatedHeading from "../components/AnimatedHeading";
import AuthModal from "../components/AuthModal";

export default function Dashboard() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const handleGetStarted = () => {
    const token = localStorage.getItem("token");
    if (token) {
      // Check if user is admin
      const userEmail = localStorage.getItem("userEmail");
      if (userEmail === "sruthirangaraj03@gmail.com") {
        navigate("/admin");
      } else {
        navigate("/products");
      }
    } else {
      setShowModal(true);
    }
  };

  // Handle successful login/signup from AuthModal
  const handleAuthSuccess = (userData) => {
    // Store user data in localStorage
    localStorage.setItem("token", userData.token);
    localStorage.setItem("userEmail", userData.email);
    
    // Close modal
    setShowModal(false);
    
    // Redirect based on user role
    if (userData.email === "sruthirangaraj03@gmail.com") {
      navigate("/admin");
    } else {
      navigate("/products");
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center relative"
      style={{ backgroundImage: `url(${dashboard})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-indigo-900/70 z-0" />

      <div className="relative z-10 flex flex-col items-center justify-between py-10 px-6 md:px-20 min-h-screen">
        

        <div className="flex-grow flex flex-col items-center justify-center text-center">
          <AnimatedHeading text="Curated Art. Crafted Stories. Yours to Keep." />

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-lg text-white/90 max-w-xl mb-10 leading-relaxed"
          >
            CanvasCart empowers artists to showcase and monetize their creative work in a sleek, modern marketplace.
          </motion.p>

          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: "0 8px 24px rgba(99, 102, 241, 0.6)",
            }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGetStarted}
            className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-indigo-600 hover:to-purple-600 text-white px-10 py-3 rounded-full text-lg font-semibold transition shadow-lg"
          >
            Get Started
          </motion.button>
        </div>
      </div>

      <AuthModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}