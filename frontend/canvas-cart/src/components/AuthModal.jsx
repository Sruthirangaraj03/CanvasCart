// src/components/AuthModal.jsx
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AuthModal({ isOpen, onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
  });
  
  useEffect(() => {
    if (isLogin) {
      const savedEmail = localStorage.getItem("email") || "";
      const savedPassword = localStorage.getItem("password") || "";
      setLoginData({ email: savedEmail, password: savedPassword });
    }
  }, [isLogin]);

  const handleLogin = async (e) => {
  e.preventDefault();

  try {
    const res = await axios.post("http://localhost:8000/api/auth/login", loginData);

    // ✅ Store token and user info
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("email", loginData.email);
    localStorage.setItem("password", loginData.password);
    localStorage.setItem("user", JSON.stringify(res.data.user)); // Store user object

    alert("Login Successful! 🎉");

    onClose();               // Close modal
    navigate("/products"); 
  } catch (err) {
    alert(err.response?.data?.message || "Login failed ❌");
  }
};

  const handleSignup = async (e) => {
  e.preventDefault();

  if (signupData.password !== signupData.confirmPassword) {
    return alert("❌ Passwords do not match");
  }

  try {
    await axios.post("http://localhost:8000/api/auth/signup", signupData);
    alert("Signup Successful! 🎨 Please login now");

    setIsLogin(true); // Switch to login tab
  } catch (err) {
    alert(err.response?.data?.message || "Signup failed ❌");
  }
};

  const inputStyle =
    "w-full border border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl px-4 py-3 text-sm placeholder-gray-400 bg-white/90";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-xl mx-auto mt-20 p-10 relative"
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-5 text-gray-400 hover:text-black text-2xl"
            >
              &times;
            </button>

            <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 text-indigo-700 tracking-tight">
              {isLogin ? "Welcome Back to CanvasCart" : "Create a New Account"}
            </h2>

            <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-4">
              {!isLogin && (
                <>
                  <input className={inputStyle} placeholder="First Name" value={signupData.firstName} onChange={(e) => setSignupData({ ...signupData, firstName: e.target.value })} />
                  <input className={inputStyle} placeholder="Last Name" value={signupData.lastName} onChange={(e) => setSignupData({ ...signupData, lastName: e.target.value })} />
                  <input className={inputStyle} placeholder="Username" value={signupData.username} onChange={(e) => setSignupData({ ...signupData, username: e.target.value })} />
                  <input className={inputStyle} placeholder="Phone" value={signupData.phone} onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })} />
                  <input className={inputStyle} placeholder="Address" value={signupData.address} onChange={(e) => setSignupData({ ...signupData, address: e.target.value })} />
                </>
              )}

              <input
                type="email"
                className={inputStyle}
                placeholder="Email"
                value={isLogin ? loginData.email : signupData.email}
                onChange={(e) => isLogin ? setLoginData({ ...loginData, email: e.target.value }) : setSignupData({ ...signupData, email: e.target.value })}
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className={`${inputStyle} pr-10`}
                  placeholder="Password"
                  value={isLogin ? loginData.password : signupData.password}
                  onChange={(e) => isLogin ? setLoginData({ ...loginData, password: e.target.value }) : setSignupData({ ...signupData, password: e.target.value })}
                />
                <div
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
              </div>

              {!isLogin && (
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className={`${inputStyle} pr-10`}
                    placeholder="Confirm Password"
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                  />
                  <div
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 rounded-xl font-semibold tracking-wide shadow-md transition"
              >
                {isLogin ? "Log In and Explore 🎨" : "Sign Up & Start Creating 🌟"}
              </button>
            </form>

            <p className="text-sm text-center mt-6 text-gray-600">
              {isLogin ? "New here? Ready to showcase your art?" : "Already have an account?"}{" "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-indigo-600 font-bold hover:underline"
              >
                {isLogin ? "Sign Up Now" : "Log In"}
              </button>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
