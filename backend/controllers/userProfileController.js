// Add this to backend/controllers/userController.js
const { User } = require("../models");

exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const { username } = req.body;
    if (!username) return res.status(400).json({ message: "Username is required" });
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.username = username;
    await user.save();
    res.json({ id: user.id, username: user.username, email: user.email, role: user.role });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.changeUserPassword = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: "Current and new password are required" });
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    const valid = await user.validatePassword(currentPassword);
    if (!valid) return res.status(400).json({ message: "Current password is incorrect" });
    user.password = newPassword;
    await user.save();
    res.json({ message: "Password updated successfully" });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};
