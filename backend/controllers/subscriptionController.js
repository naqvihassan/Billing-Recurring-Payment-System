const { Subscription, Plan, User } = require("../models");

exports.createSubscription = async (req, res) => {
  try {
    const { planId, billingDay } = req.body;
    const userId = req.user.id;

    if (!billingDay || billingDay < 1 || billingDay > 28) {
      return res.status(400).json({ message: "Billing day must be between 1 and 28" });
    }

    const plan = await Plan.findByPk(planId);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    const existingSubscription = await Subscription.findOne({
      where: {
        userId,
        planId,
        status: 'active'
      }
    });

    if (existingSubscription) {
      return res.status(400).json({ message: "You already have an active subscription to this plan" });
    }

    const now = new Date();
    let nextBillingDate = new Date(now.getFullYear(), now.getMonth(), billingDay);
    
    if (nextBillingDate <= now) {
      nextBillingDate = new Date(now.getFullYear(), now.getMonth() + 1, billingDay);
    }

    const subscription = await Subscription.create({
      userId,
      planId,
      billing_day: billingDay,
      next_billing_date: nextBillingDate,
      monthly_fee_snapshot: plan.monthlyFee,
      status: 'active'
    });

    const subscriptionWithPlan = await Subscription.findByPk(subscription.id, {
      include: [{ model: Plan, as: 'plan' }]
    });

    res.status(201).json({
      message: "Subscription created successfully",
      subscription: subscriptionWithPlan
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUserSubscriptions = async (req, res) => {
  try {
    const userId = req.user.id;

    const subscriptions = await Subscription.findAll({
      where: { userId },
      include: [{ model: Plan, as: 'plan' }],
      order: [['createdAt', 'DESC']]
    });

    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.cancelSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const userId = req.user.id;

    const subscription = await Subscription.findOne({
      where: { id: subscriptionId, userId }
    });

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    if (subscription.status !== 'active') {
      return res.status(400).json({ message: "Subscription is not active" });
    }

    await subscription.update({
      status: 'cancelled',
      cancelled_at: new Date()
    });

    res.json({ message: "Subscription cancelled successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
