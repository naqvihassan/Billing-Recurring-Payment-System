const { Subscription } = require('../models');
const invoiceController = require('./invoiceController');

exports.runBillingForDueAccounts = async (req, res) => {
  try {
    const today = new Date();
    const billingDay = today.getDate();
    const dueSubscriptions = await Subscription.findAll({
      where: { billing_day: billingDay, status: 'active' }
    });
    let count = 0;
    for (const sub of dueSubscriptions) {
      await invoiceController.createBillingDayInvoice(sub, today);
      count++;
    }
    res.json({ message: `Billing run complete. ${count} invoices generated.` });
  } catch (e) {
    res.status(500).json({ message: 'Error running billing.' });
  }
};
