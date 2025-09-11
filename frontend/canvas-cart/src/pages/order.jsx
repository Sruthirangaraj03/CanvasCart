import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const Order = () => {
  const [form, setForm] = useState({
    fullName: "", email: "", phone: "", address: "",
    city: "", state: "", country: "India", pincode: ""
  });

  const [error, setError] = useState("");

  const validateForm = () => {
    for (let key in form) {
      if (!form[key]) return `${key} is required`;
    }
    if (!/^\d{6}$/.test(form.pincode)) return "Invalid pincode";
    if (!/^\d{10}$/.test(form.phone)) return "Phone must be 10 digits";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Invalid email";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) return setError(validationError);
    setError("");

    try {
      const res = await axios.post(
        "http://localhost:5001/api/orders/place",
        {
          shippingAddress: form,
          paymentIntentId: "dummy-id"
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      alert("✅ Order placed!");
    } catch (err) {
      setError("Failed to place order.");
    }
  };

  return (
    <motion.div
      className="max-w-xl mx-auto p-6 bg-white rounded-2xl shadow-xl mt-10"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="text-2xl font-bold mb-4 text-center">Checkout</h2>

      {error && <div className="text-red-600 mb-2">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {["fullName", "email", "phone", "address", "city", "pincode"].map((field) => (
          <input
            key={field}
            type={field === "email" ? "email" : "text"}
            placeholder={field.replace(/([A-Z])/g, " $1")}
            className="w-full p-2 border border-gray-300 rounded-md"
            value={form[field]}
            onChange={(e) => setForm({ ...form, [field]: e.target.value })}
          />
        ))}

        <select
          className="w-full p-2 border border-gray-300 rounded-md"
          value={form.state}
          onChange={(e) => setForm({ ...form, state: e.target.value })}
        >
          <option value="">Select State</option>
          {indianStates.map((state) => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>

        <select
          className="w-full p-2 border border-gray-300 rounded-md"
          value={form.country}
          onChange={(e) => setForm({ ...form, country: e.target.value })}
        >
          <option value="India">India</option>
        </select>

        <button
          type="submit"
          className="w-full bg-[#555879] text-white p-2 rounded-md hover:bg-[#44455e]"
        >
          Place Order
        </button>
      </form>
    </motion.div>
  );
};

export default Order;
