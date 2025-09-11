const User = require("../models/user");
const bcrypt = require("bcryptjs");

// 👤 Get current user profile (protected)
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error getting profile", error: error.message });
  }
};

// ✏️ Update current user profile (protected)
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: "User not found" });

    const { firstName, lastName, username, email, phone, address, password } = req.body;
    if (firstName) user.firstName = firstName;
     if (lastName) user.lastName = lastName;
    if (username) user.username = username;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (password) user.password = await bcrypt.hash(password, 10);

    const updatedUser = await user.save();

    res.status(200).json({
      message: "Profile updated",
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating profile", error: error.message });
  }
};

// 👑 (Optional) Admin: Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to get users", error: error.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!role || !["buyer", "seller"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { role },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      message: `Role updated to ${user.role}`,
      role: user.role
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to update role", error: err.message });
  }
};

