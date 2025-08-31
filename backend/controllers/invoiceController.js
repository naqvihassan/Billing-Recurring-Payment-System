const { Invoice, Subscription, Plan, Usage, Feature, User } = require("../models");
const { Op } = require("sequelize");
const { sendInvoiceEmail } = require("../utils/email");
const { renderInvoiceHtml } = require("../utils/invoiceEmailTemplate");

exports.createSubscriptionInvoice = async (subscription) => {
  const plan = await Plan.findByPk(subscription.planId);
  if (!plan) throw new Error("Plan not found");
  const user = await User.findByPk(subscription.userId);
  if (!user) throw new Error("User not found");


  const invoice = await Invoice.create({
    userId: user.id,
    subscriptionId: subscription.id,
    amount: plan.monthlyFee,
    status: "unpaid",
    invoiceDate: new Date(),
    dueDate: new Date(),
    lineItems: [
      {
        type: "plan_fee",
        description: `Monthly fee for plan ${plan.name}`,
        amount: plan.monthlyFee
      }
    ],
    notes: "Initial subscription invoice"
  });

  const { Transaction } = require("../models");
  await Transaction.create({
    userId: user.id,
    invoiceId: invoice.id,
    amount: plan.monthlyFee,
    type: "subscription",
    status: "success",
    description: `Initial subscription charge for plan ${plan.name}`
  });

  try {
    await sendInvoiceEmail({
      to: user.email,
      subject: `Your Subscription Invoice (#${invoice.id})` ,
      html: renderInvoiceHtml(invoice, user)
    });
  } catch (e) {
    console.error("Failed to send invoice email:", e);
  }

  return invoice;
};

exports.createBillingDayInvoice = async (subscription, billingDate) => {
  const plan = await Plan.findByPk(subscription.planId, { include: [ { association: "Features" } ] });
  if (!plan) throw new Error("Plan not found");
  const user = await User.findByPk(subscription.userId);
  if (!user) throw new Error("User not found");

  const usages = await Usage.findAll({
    where: {
      subscriptionId: subscription.id,
      usage_date: {
        [Op.gte]: new Date(billingDate.getFullYear(), billingDate.getMonth(), 1),
        [Op.lte]: billingDate
      }
    },
    include: [ { model: Feature, as: "feature" } ]
  });

  let overuseTotal = 0;
  const overuseItems = [];
  for (const feature of plan.Features) {
    const maxUnits = feature.max_unit_limit;
    const unitPrice = feature.unit_price;
    const usedUnits = usages
      .filter(u => u.planFeature?.featureId === feature.id)
      .reduce((sum, u) => sum + Number(u.units_used || 0), 0);
    if (maxUnits && usedUnits > maxUnits) {
      const overused = usedUnits - maxUnits;
      const charge = overused * unitPrice;
      overuseTotal += charge;
      overuseItems.push({
        type: "overuse",
        description: `Overuse of feature ${feature.name} (${feature.code})`,
        amount: charge,
        units: overused,
        unitPrice
      });
    }
  }

  const totalAmount = Number(plan.monthlyFee) + Number(overuseTotal);

  const invoice = await Invoice.create({
    userId: user.id,
    subscriptionId: subscription.id,
    amount: totalAmount,
    status: "unpaid",
    invoiceDate: billingDate,
    dueDate: billingDate,
    lineItems: [
      {
        type: "plan_fee",
        description: `Monthly fee for plan ${plan.name}`,
        amount: plan.monthlyFee
      },
      ...overuseItems
    ],
    notes: "Recurring billing invoice"
  });

  const { Transaction } = require("../models");
  await Transaction.create({
    userId: user.id,
    invoiceId: invoice.id,
    amount: Number(plan.monthlyFee),
    type: "recurring",
    status: "success",
    description: `Recurring monthly charge for plan ${plan.name}`
  });

  if (Number(overuseTotal) > 0) {
    await Transaction.create({
      userId: user.id,
      invoiceId: invoice.id,
      amount: Number(overuseTotal),
      type: "overuse",
      status: "success",
      description: `Overuse charge for plan ${plan.name}`
    });
  }

  try {
    await sendInvoiceEmail({
      to: user.email,
      subject: `Your Monthly Invoice (#${invoice.id})` ,
      html: renderInvoiceHtml(invoice, user)
    });
  } catch (e) {
    console.error("Failed to send invoice email:", e);
  }

  return invoice;
};
