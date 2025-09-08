const { Subscription, Plan, User } = require("../models");

exports.getUserSubscriptionsWithFeatures = async (req, res) => {
  try {
    const { userId } = req.params;
    const subscriptions = await Subscription.findAll({
      where: { userId },
      include: [
        {
          model: Plan,
          as: "plan",
          include: [{ association: "Features", through: { attributes: ["id"] } }]
        }
      ],
      order: [["createdAt", "DESC"]]
    });
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "username", "email", "role"]
    });
    res.json(users);
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    const user = await User.findByPk(userId, {
      attributes: ["id", "username", "email", "role", "photo"],
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};
