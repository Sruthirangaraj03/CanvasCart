const express = require("express");
const { checkout, verify } = require("../controllers/paymentControllers");
const router = express.Router();

router.post("/checkout", checkout);
router.post("/verify", verify);

module.exports = router;
