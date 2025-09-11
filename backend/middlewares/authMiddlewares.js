const jwt = require("jsonwebtoken");
const User = require("../models/user");

// Protect route: verifies token and attaches user
exports.protect = async (req, res, next) => {
  let token = req.headers.authorization;

  if (token && token.startsWith("Bearer")) {
    try {
      token = token.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      req.user = user;
      next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  } else {
    return res.status(401).json({ message: "No token provided" });
  }
};

// ✅ Admin check: only for sruthirangaraj03@gmail.com
exports.isAdmin = (req, res, next) => {
  const adminEmail = "sruthirangaraj03@gmail.com";
  
  if (req.user && req.user.email === adminEmail) {
    next(); // ✅ only Sruthi is allowed
  } else {
    res.status(403).json({ message: "Only Sruthi (admin) can access this route." });
  }
};
