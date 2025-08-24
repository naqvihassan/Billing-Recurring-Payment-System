const { User } = require("../models");

exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    const user = await User.findByPk(userId, {
      attributes: ["id", "username", "email", "role"],
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};
