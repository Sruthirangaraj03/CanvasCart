require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const userRoutes = require("./routes/userRoutes")
const orderRoutes = require("./routes/orderRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const shippingRoutes = require("./routes/shippingRoutes");
const paymentRoutes = require("./routes/paymentRoutes");


const app = express();
const PORT = process.env.PORT || 8000;

//Only keep working middleware here
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true //cookies
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/user",userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/checkout", shippingRoutes);
app.use("/api/webhook", express.raw({ type: "application/json" }));
app.use("/api/payment", paymentRoutes);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB Connected ✅"))
.catch((err) => console.error("MongoDB Connection Error ❌", err));

app.get("/", (req, res) => {
  res.send("CanvasCart Backend is Running 🛒");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} 🚀`);
});
