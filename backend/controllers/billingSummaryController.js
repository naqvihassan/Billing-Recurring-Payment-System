const { Invoice, Subscription } = require("../models");

exports.getUserBillingSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const unpaidInvoices = await Invoice.findAll({
      where: { userId, status: "unpaid" },
      attributes: ["amount"]
    });
  const amountDue = unpaidInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0);

    const subs = await Subscription.findAll({
      where: { userId, status: "active" },
      attributes: ["billing_day"]
    });
    let nextBillingDate = null;
    if (subs.length > 0) {
      const today = new Date();
      const days = subs.map(s => s.billing_day).sort((a, b) => a - b);

      const nextDay = days.find(d => d >= today.getDate());
      const month = nextDay ? today.getMonth() : today.getMonth() + 1;
      const day = nextDay || days[0];
      nextBillingDate = new Date(today.getFullYear(), month, day);
    }
    res.json({
      amountDue: amountDue.toFixed(2),
      nextBillingDate: nextBillingDate ? nextBillingDate.toISOString() : null
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch billing summary" });
  }
};
