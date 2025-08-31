const { Transaction, Invoice, User } = require("../models");

exports.getUserTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const transactions = await Transaction.findAll({
      where: { userId },
      include: [
        { model: Invoice, as: "invoice", attributes: ["id", "amount", "status"] },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
};

exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      include: [
        { model: User, as: "user", attributes: ["id", "username", "email"] },
        { model: Invoice, as: "invoice", attributes: ["id", "amount", "status"] },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
};
