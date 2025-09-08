
exports.updateInvoiceStatus = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const { status } = req.body;
    const allowedStatuses = ['paid', 'unpaid', 'overdue', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const invoice = await Invoice.findByPk(invoiceId);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    invoice.status = status;
    await invoice.save();
    res.json({ message: 'Invoice status updated', invoice });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
};
const { Invoice } = require("../models");

exports.listUserInvoices = async (req, res) => {
  try {
    const userId = req.user.id;
    const invoices = await Invoice.findAll({
      where: { userId },
      order: [["invoiceDate", "DESC"]]
    });
    res.json(invoices);
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.listAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.findAll({
      order: [["invoiceDate", "DESC"]],
      include: [
        { model: require("../models").User, as: "user", attributes: ["id", "username", "email"] },
        { model: require("../models").Subscription, as: "subscription", attributes: ["id", "planId"], include: [
          { model: require("../models").Plan, as: "plan", attributes: ["id", "name"] }
        ] }
      ]
    });
    res.json(invoices);
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getInvoiceDetails = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const invoice = await Invoice.findByPk(invoiceId, {
      include: [
        { model: require("../models").User, as: "user", attributes: ["id", "username", "email"] },
        { model: require("../models").Subscription, as: "subscription", attributes: ["id", "planId"], include: [
          { model: require("../models").Plan, as: "plan", attributes: ["id", "name"], include: [
            { model: require("../models").Feature, as: "Features", attributes: ["id", "name", "unit_price", "max_unit_limit"] }
          ] }
        ] }
      ]
    });
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    res.json(invoice);
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};
