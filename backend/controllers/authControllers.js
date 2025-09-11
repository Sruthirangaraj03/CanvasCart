const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// 🔐 JWT Token Generator
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// ✅ SIGNUP CONTROLLER
exports.signup = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      username,
      email,
      password,
      phone,
      address
    } = req.body;

    // Prevent duplicate email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Determine role:
    let role = "buyer";
    if (email === "sruthirangaraj03@gmail.com") {
      role = "admin"; // only this user is allowed to be admin
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
      phone,
      address,
      role
    });

    await newUser.save();

    const token = generateToken(newUser);

    res.status(201).json({
      message: "Signup successful",
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        fullName: `${newUser.firstName} ${newUser.lastName}`,
        phone: newUser.phone,
        address: newUser.address,
        role: newUser.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Signup failed", error: error.message });
  }
};

// ✅ LOGIN CONTROLLER
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    // ⚠️ Auto-check: if this is Sruthi, make sure role is 'admin'
    if (email === "sruthirangaraj03@gmail.com" && user.role !== "admin") {
      user.role = "admin";
      await user.save(); // ensure Sruthi always has admin rights
    }

    const token = generateToken(user);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};
