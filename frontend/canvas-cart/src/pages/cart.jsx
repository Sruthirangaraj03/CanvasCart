import React, { useEffect, useState } from "react";
import { 
  Trash2, 
  Minus, 
  Plus, 
  CreditCard, 
  Smartphone, 
  DollarSign, 
  Truck, 
  CheckCircle, 
  Package, 
  User, 
  Download,
  ShoppingCart,
  ArrowLeft,
  Shield,
  Clock,
  MapPin,
  Phone,
  Mail,
  FileText,
  Star,
  Award
} from "lucide-react";

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [step, setStep] = useState("cart");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [userData, setUserData] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
  });

  const API_BASE = "http://localhost:8000";

  // Load Razorpay script dynamically
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    script.onerror = () => setError("Failed to load Razorpay. Please refresh the page.");
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const inputStyle = "border border-slate-300 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full transition-all duration-200 bg-white shadow-sm hover:shadow-md";

  const apiCall = async (endpoint, options = {}) => {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  };

  const getAuthToken = () => {
    return window.authToken || (typeof localStorage !== 'undefined' ? localStorage.getItem("token") : null);
  };

  // Fetch user data
  const fetchUserData = async () => {
    try {
      const data = await apiCall('/api/user/profile', {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      setUserData(data.user);
      // Pre-fill form with user data if available
      if (data.user) {
        setFormData(prev => ({
          ...prev,
          fullName: data.user.username || prev.fullName,
          email: data.user.email || prev.email,
          phone: data.user.phone || prev.phone,
        }));
      }
    } catch (err) {
      console.error("Error fetching user data", err);
    }
  };

  const handleSubmit = async () => {
    const requiredFields = ['fullName', 'email', 'phone', 'address', 'city', 'state', 'country', 'pincode'];
    const missingFields = requiredFields.filter(field => !formData[field].trim());
    
    if (missingFields.length > 0) {
      setError(`Please complete the following fields: ${missingFields.join(', ')}`);
      return;
    }

    setLoading(true);
    setError("");

    try {
      await apiCall('/api/checkout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(formData)
      });

      console.log("Shipping Information Saved");
      setStep("payment");
    } catch (error) {
      console.error("Error saving shipping info:", error);
      setError("Unable to save shipping details. Please verify your information and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!razorpayLoaded) {
      setError("Payment system is initializing. Please wait a moment...");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = getAuthToken();
      if (!token) {
        setError("Authentication required. Please login to continue with payment.");
        return;
      }

      // Create order
      const orderData = await apiCall('/api/payment/checkout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: totalPrice * 100,
        })
      });

      const options = {
        key: "rzp_test_3YQmwLJrVOr6nA",
        amount: orderData.order.amount,
        currency: "INR",
        name: "CanvasCart",
        description: "Premium Art Collection Purchase",
        order_id: orderData.order.id,
        handler: async (response) => {
          try {
            // Prepare cart items for payment verification
            const formattedCartItems = cartItems.map(item => ({
              productId: item.product._id,
              name: item.product.title,
              price: item.product.price,
              quantity: item.quantity,
              image: item.product.image || "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop"
            }));

            // Prepare user details
            const userDetails = {
              userId: userData?._id || null,
              username: userData?.username || formData.fullName,
              email: userData?.email || formData.email,
              phone: userData?.phone || formData.phone,
            };

            const verifyRes = await apiCall('/api/payment/verify', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount: totalPrice * 100,
                cartItems: formattedCartItems,
                userDetails: userDetails,
                shippingDetails: {
                  fullName: formData.fullName,
                  address: formData.address,
                  city: formData.city,
                  state: formData.state,
                  pincode: formData.pincode,
                  phone: formData.phone,
                }
              })
            });

            if (verifyRes.success) {
              setPaymentData(verifyRes.payment);
              setStep("success");
              // Clear cart after successful payment
              setCartItems([]);
              setTotalPrice(0);
            } else {
              setError("Payment verification failed. Please contact our support team for assistance.");
            }
          } catch (err) {
            console.error("Payment verification error:", err);
            setError("Payment verification failed. Please contact our support team for assistance.");
          }
        },
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: "#8b5cf6",
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        setError("Payment failed: " + response.error.description);
        setLoading(false);
      });
      
      rzp.open();
    } catch (err) {
      console.error("Payment Error:", err);
      setError("Payment processing failed. Please try again or contact support.");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { key: "cart", label: "Shopping Cart", icon: ShoppingCart },
    { key: "checkout", label: "Checkout", icon: FileText },
    { key: "payment", label: "Payment", icon: CreditCard },
    { key: "success", label: "Complete", icon: CheckCircle },
  ];

  const fetchCart = async () => {
    setLoading(true);
    try {
      const data = await apiCall('/api/cart', {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      
      setCartItems(data.items || []);
      recalculateTotal(data.items || []);
    } catch (err) {
      console.error("Error fetching cart", err);
      setError("Unable to load cart items. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  const recalculateTotal = (items) => {
    let total = 0;
    for (const item of items) {
      const price = parseFloat(item.product?.price) || 0;
      const qty = parseInt(item.quantity) || 0;
      total += price * qty;
    }
    setTotalPrice(total);
  };

  const updateQuantity = async (productId, type) => {
    setLoading(true);
    try {
      await apiCall('/api/cart/update', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ productId, type })
      });
      
      fetchCart();
    } catch (err) {
      console.error("Error updating quantity", err);
      setError("Unable to update quantity. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (productId) => {
    setLoading(true);
    try {
      await apiCall(`/api/cart/remove/${productId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      
      fetchCart();
    } catch (err) {
      console.error("Error removing item", err);
      setError("Unable to remove item. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
    fetchUserData();
  }, []);

  const renderSuccessPage = () => (
    <div className="max-w-5xl mx-auto px-6">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-white text-center">
          <CheckCircle className="mx-auto mb-4" size={80} />
          <h1 className="text-4xl font-bold mb-2">Payment Successful</h1>
          <p className="text-lg opacity-90">Thank you for your purchase. Your order has been confirmed and is being processed.</p>
        </div>

        <div className="p-8">
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Payment Details */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-3 text-slate-800">
                <CreditCard className="text-purple-600" size={24} />
                Payment Information
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-slate-200">
                  <span className="text-slate-600 font-medium">Payment ID:</span>
                  <span className="font-mono text-sm text-slate-800 bg-slate-100 px-3 py-1 rounded">
                    {paymentData?.razorpay_payment_id?.slice(0, 20) || 'N/A'}...
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-200">
                  <span className="text-slate-600 font-medium">Order ID:</span>
                  <span className="font-mono text-sm text-slate-800 bg-slate-100 px-3 py-1 rounded">
                    {paymentData?.razorpay_order_id?.slice(0, 20) || 'N/A'}...
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-200">
                  <span className="text-slate-600 font-medium">Amount Paid:</span>
                  <span className="font-bold text-xl text-slate-800">₹{((paymentData?.amount || 0) / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-600 font-medium">Status:</span>
                  <span className="text-green-600 font-semibold flex items-center gap-2">
                    <CheckCircle size={16} />
                    Completed
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-3 text-slate-800">
                <User className="text-purple-600" size={24} />
                Customer Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 py-2">
                  <User className="text-slate-400" size={16} />
                  <div>
                    <span className="text-slate-600 text-sm">Name</span>
                    <p className="font-medium text-slate-800">{formData.fullName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 py-2">
                  <Mail className="text-slate-400" size={16} />
                  <div>
                    <span className="text-slate-600 text-sm">Email</span>
                    <p className="font-medium text-slate-800">{formData.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 py-2">
                  <Phone className="text-slate-400" size={16} />
                  <div>
                    <span className="text-slate-600 text-sm">Phone</span>
                    <p className="font-medium text-slate-800">{formData.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 py-2">
                  <MapPin className="text-slate-400" size={16} />
                  <div>
                    <span className="text-slate-600 text-sm">Shipping Address</span>
                    <p className="font-medium text-slate-800">
                      {`${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Purchased Items */}
          {paymentData?.cartItems && paymentData.cartItems.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-3 text-slate-800">
                <Package className="text-purple-600" size={24} />
                Order Items
              </h3>
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <div className="space-y-4">
                  {paymentData.cartItems.map((item, index) => (
                    <div key={index} className="bg-white rounded-lg p-4 flex items-center gap-4 shadow-sm border border-slate-200">
                      <div className="relative">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                          {item.quantity}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-800 text-lg">{item.name}</h4>
                        <p className="text-slate-600">
                          Unit Price: ₹{item.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-xl text-slate-800">₹{(item.quantity * item.price).toFixed(2)}</p>
                        <p className="text-slate-500 text-sm">{item.quantity} × ₹{item.price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => window.print()}
              className="bg-purple-600 text-white px-8 py-4 rounded-lg hover:bg-purple-700 transition-all duration-200 flex items-center justify-center gap-3 font-medium shadow-lg hover:shadow-xl"
            >
              <Download size={20} />
              Download Receipt
            </button>
            <button 
              onClick={() => {
                setStep("cart");
                setPaymentData(null);
              }}
              className="bg-slate-200 text-slate-700 px-8 py-4 rounded-lg hover:bg-slate-300 transition-all duration-200 font-medium"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLeftContent = () => {
    switch (step) {
      case "success":
        return renderSuccessPage();
        
      case "cart":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-3">
                <ShoppingCart className="text-purple-600" size={28} />
                Your Cart ({cartItems.length} items)
              </h2>
              <p className="text-slate-600">Review your selected items before proceeding to checkout</p>
            </div>
            
            {cartItems.map((item) => (
              <div
                key={item.product._id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all duration-200"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="relative">
                    <img
                      src={item.product.image || "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop"}
                      alt={item.product.title}
                      className="w-full lg:w-40 h-48 lg:h-40 object-cover rounded-lg shadow-sm"
                    />
                    <div className="absolute top-3 right-3 bg-purple-600 text-white px-2 py-1 rounded text-sm font-medium">
                      Premium
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-800 mb-2">
                        {item.product.title}
                      </h3>
                      <p className="text-slate-600 leading-relaxed">
                        {item.product.description?.slice(0, 100)}...
                      </p>
                    </div>
                    
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-4">
                          <span className="text-slate-700 font-medium">Quantity:</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.product._id, "dec")}
                              disabled={loading || item.quantity <= 1}
                              className="w-10 h-10 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="w-12 text-center text-xl font-bold text-slate-800">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product._id, "inc")}
                              disabled={loading}
                              className="w-10 h-10 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-3xl font-bold text-slate-800">
                            ₹{(item.product.price * item.quantity).toFixed(2)}
                          </p>
                          <p className="text-slate-500">
                            ₹{parseFloat(item.product.price).toFixed(2)} per piece
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2">
                      <div className="flex items-center gap-2 text-green-600">
                        <Shield size={16} />
                        <span className="text-sm">Authenticity Guaranteed</span>
                      </div>
                      <button
                        onClick={() => removeItem(item.product._id)}
                        disabled={loading}
                        className="text-red-500 hover:text-red-700 disabled:opacity-50 flex items-center gap-2 px-3 py-1 rounded hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={16} /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case "checkout":
        return (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-3">
                <FileText className="text-purple-600" size={32} />
                Shipping Information
              </h2>
              <p className="text-slate-600">Please provide your delivery details to complete your order</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { key: "fullName", label: "Full Name", type: "text", icon: User, required: true },
                { key: "email", label: "Email Address", type: "email", icon: Mail, required: true },
                { key: "phone", label: "Phone Number", type: "tel", icon: Phone, required: true },
                { key: "address", label: "Street Address", type: "text", icon: MapPin, required: true },
                { key: "city", label: "City", type: "text", icon: MapPin, required: true },
                { key: "state", label: "State", type: "text", icon: MapPin, required: true },
                { key: "country", label: "Country", type: "text", icon: MapPin, required: true },
                { key: "pincode", label: "PIN Code", type: "text", icon: MapPin, required: true },
              ].map((field) => (
                <div key={field.key} className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 flex items-center gap-2">
                    <field.icon size={16} className="text-slate-400" />
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type={field.type}
                    name={field.key}
                    placeholder={`Enter your ${field.label.toLowerCase()}`}
                    required={field.required}
                    className={inputStyle}
                    value={formData[field.key]}
                    onChange={(e) =>
                      setFormData({ ...formData, [field.key]: e.target.value })
                    }
                  />
                </div>
              ))}
            </div>
            
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 text-white px-12 py-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg shadow-lg hover:shadow-xl flex items-center gap-3"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    Continue to Payment
                    <CreditCard size={20} />
                  </>
                )}
              </button>
            </div>
          </div>
        );

      case "payment":
        return (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-3">
                <CreditCard className="text-purple-600" size={32} />
                Secure Payment
              </h2>
              <div className="flex items-center gap-2 text-slate-600">
                <Shield size={16} />
                <p>All transactions are secure and encrypted</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              {[
                { 
                  name: "Credit/Debit Card", 
                  icon: CreditCard, 
                  desc: "Visa, Mastercard, RuPay, American Express",
                  popular: true 
                },
                { 
                  name: "UPI", 
                  icon: Smartphone, 
                  desc: "Google Pay, PhonePe, Paytm, BHIM" 
                },
                { 
                  name: "Net Banking", 
                  icon: DollarSign, 
                  desc: "All major banks supported" 
                },
                { 
                  name: "Cash on Delivery", 
                  icon: Truck, 
                  desc: "Pay when you receive your order" 
                },
              ].map((method, i) => (
                <label
                  key={method.name}
                  className="flex items-center gap-4 border border-slate-300 rounded-xl p-6 cursor-pointer hover:shadow-md transition-all duration-200 hover:border-purple-300 bg-white relative"
                >
                  {method.popular && (
                    <div className="absolute -top-2 right-4 bg-purple-600 text-white text-xs px-3 py-1 rounded-full">
                      Most Popular
                    </div>
                  )}
                  <input 
                    type="radio" 
                    name="payment" 
                    defaultChecked={i === 0}
                    className="text-purple-600 w-4 h-4"
                  />
                  <method.icon className="text-purple-600" size={28} />
                  <div className="flex-1">
                    <span className="font-semibold text-slate-800 text-lg">{method.name}</span>
                    <p className="text-slate-600">{method.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="bg-slate-50 rounded-lg p-6 mb-8 border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <Award className="text-green-600" size={20} />
                <span className="font-semibold text-slate-800">Security Features</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Shield size={16} className="text-green-600" />
                  256-bit SSL Encryption
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-600" />
                  PCI DSS Compliant
                </div>
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={loading || !razorpayLoaded}
              className="w-full bg-purple-600 text-white py-4 rounded-lg hover:bg-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing Payment...
                </>
              ) : !razorpayLoaded ? (
                <>
                  <Clock size={20} />
                  Initializing Payment Gateway...
                </>
              ) : (
                <>
                  <Shield size={20} />
                  Pay Securely - ₹{totalPrice.toFixed(2)}
                </>
              )}
            </button>

            <p className="text-xs text-center text-slate-500 mt-6 leading-relaxed">
              By completing this purchase, you agree to our{" "}
              <a href="#" className="underline text-purple-600 hover:text-purple-700">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="underline text-purple-600 hover:text-purple-700">
                Privacy Policy
              </a>
              . Your payment information is processed securely and never stored on our servers.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-10 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-slate-200">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-red-500" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Something went wrong</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                setError("");
                fetchCart();
              }}
              className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              Try Again
            </button>
            <button
              onClick={() => setStep("cart")}
              className="flex-1 bg-slate-200 text-slate-700 px-6 py-3 rounded-lg hover:bg-slate-300 transition-colors font-medium"
            >
              Return to Cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8">
      

      {/* Progress Steps */}
      {step !== "success" && (
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-center">
              {steps.slice(0, 3).map((s, i) => {
                const isActive = step === s.key;
                const isCompleted = steps.findIndex(step => step.key === s.key) < steps.findIndex(step => step.key === step);
                
                return (
                  <div key={s.key} className="flex items-center flex-1">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                          isActive 
                            ? "bg-purple-600 text-white shadow-lg" 
                            : isCompleted 
                            ? "bg-green-600 text-white"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {isCompleted ? <CheckCircle size={20} /> : <s.icon size={20} />}
                      </div>
                      <div>
                        <div
                          className={`font-semibold transition-colors ${
                            isActive ? "text-purple-600" : isCompleted ? "text-green-600" : "text-slate-600"
                          }`}
                        >
                          {s.label}
                        </div>
                        <div className="text-sm text-slate-500">
                          {isActive ? "Current" : isCompleted ? "Completed" : "Pending"}
                        </div>
                      </div>
                    </div>
                    {i < 2 && (
                      <div className="flex-1 mx-4">
                        <div
                          className={`h-1 rounded-full transition-colors ${
                            isCompleted ? "bg-green-600" : "bg-slate-200"
                          }`}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {step === "success" ? (
        renderLeftContent()
      ) : cartItems.length === 0 && !loading ? (
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <ShoppingCart className="text-slate-400" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Your cart is empty</h2>
            <p className="text-slate-600 mb-8 leading-relaxed">
              Discover our curated collection of premium artworks and add some pieces to your cart to get started.
            </p>
            <button 
              onClick={() => window.location.href = '/products'}
              className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              Browse Artworks
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col xl:flex-row gap-8 max-w-7xl mx-auto">
          {/* Left Content */}
          <div className="flex-1">
            {loading && step === "cart" ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-slate-200 border-t-purple-600 rounded-full animate-spin"></div>
                  <p className="text-slate-600 font-medium">Loading your cart...</p>
                </div>
              </div>
            ) : (
              renderLeftContent()
            )}
          </div>

          {/* Right Sidebar - Professional Order Summary */}
          {step !== "success" && (
            <div className="w-full xl:w-96">
              <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8 sticky top-8">
                <h2 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-2">
                  <FileText className="text-purple-600" size={20} />
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.product._id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="relative">
                        <img
                          src={item.product.image || "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop"}
                          className="w-14 h-14 object-cover rounded-lg"
                          alt={item.product.title}
                        />
                        <div className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                          {item.quantity}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 text-sm truncate">{item.product.title}</p>
                        <p className="text-xs text-slate-500">
                          {item.quantity} × ₹{item.product.price}
                        </p>
                      </div>
                      <p className="font-bold text-slate-800">
                        ₹{(item.quantity * item.product.price).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 text-slate-700">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                    <span className="font-medium">Subtotal</span>
                    <span className="font-semibold">₹{totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <Truck size={14} className="text-slate-400" />
                      Shipping
                    </span>
                    <span className="text-green-600 font-medium">Free</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Tax & Fees</span>
                    <span className="font-medium">₹0.00</span>
                  </div>
                  <div className="flex justify-between items-center font-bold text-xl pt-4 border-t border-slate-200 text-slate-800">
                    <span>Total</span>
                    <span>₹{totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                {step === "cart" && cartItems.length > 0 && (
                  <button
                    onClick={() => setStep("checkout")}
                    className="w-full mt-8 bg-purple-600 text-white py-4 rounded-lg hover:bg-purple-700 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    Proceed to Checkout
                    <ArrowLeft className="rotate-180" size={16} />
                  </button>
                )}

                {step === "checkout" && (
                  <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 text-purple-800 text-sm">
                      <Clock size={14} />
                      <span>Complete your shipping details to proceed</span>
                    </div>
                  </div>
                )}

                {step === "payment" && (
                  <div className="mt-6 space-y-3">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 text-green-800 text-sm">
                        <CheckCircle size={14} />
                        <span>Ready for secure payment</span>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 text-center">
                      Your payment is protected by industry-leading security measures
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CartPage;