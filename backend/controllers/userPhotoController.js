const { User } = require("../models");

const fs = require("fs");
const path = require("path");

exports.uploadUserPhoto = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.photo && user.photo !== req.file.filename) {
      const oldPath = path.join(__dirname, "../uploads", user.photo);
      fs.unlink(oldPath, (err) => {
      });
    }

    user.photo = req.file.filename;
    await user.save();
    res.json({ photo: user.photo });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};
