const express = require("express");
const router = express.Router();
const { protect, isAdmin } = require("../middlewares/authMiddlewares");
const { placeOrder } = require("../controllers/orderControllers");

router.post("/place", protect, placeOrder);

module.exports = router;
