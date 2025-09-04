const { Usage, Subscription, Plan, PlanFeature, Feature, User } = require("../models");

exports.create = async (req, res) => {
  try {
    const { subscriptionId, planFeatureId, units_used, usage_date, billing_period, metadata } = req.body;

    if (!subscriptionId || !planFeatureId) {
      return res.status(400).json({ message: "subscriptionId and planFeatureId are required" });
    }

    const subscription = await Subscription.findByPk(subscriptionId, {
      include: [{ model: Plan, as: 'plan' }]
    });
    if (!subscription) return res.status(404).json({ message: "Subscription not found" });

    const planFeature = await PlanFeature.findByPk(planFeatureId, { include: [{ model: Feature, as: 'feature' }] });
    if (!planFeature) return res.status(404).json({ message: "Plan feature not found" });
    if (planFeature.planId !== subscription.planId) {
      return res.status(400).json({ message: "Feature does not belong to the subscription's plan" });
    }

    const units = Number(units_used || 0);
    if (!Number.isInteger(units) || units < 0) {
      return res.status(400).json({ message: "units_used must be a non-negative integer" });
    }

    const usageDate = usage_date ? new Date(usage_date) : new Date();
    if (isNaN(usageDate.getTime())) {
      return res.status(400).json({ message: "usage_date is invalid" });
    }

    const startedAt = new Date(subscription.started_at);
    const today = new Date();
    startedAt.setHours(0,0,0,0);
    const dateOnly = new Date(usageDate);
    dateOnly.setHours(0,0,0,0);
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    if (dateOnly < startedAt) {
      return res.status(400).json({ message: "Usage date cannot be before subscription start date" });
    }
    if (dateOnly > todayOnly) {
      return res.status(400).json({ message: "Usage date cannot be in the future" });
    }

    let period = billing_period;
    if (!period) {
      const y = usageDate.getUTCFullYear();
      const m = String(usageDate.getUTCMonth() + 1).padStart(2, '0');
      period = `${y}-${m}`;
    }

    const usage = await Usage.create({
      subscriptionId,
      planFeatureId,
      units_used: units,
      usage_date: usageDate,
      billing_period: period,
      metadata: metadata || null,
    });

    res.status(201).json(usage);
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.listBySubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const usage = await Usage.findAll({
      where: { subscriptionId },
      include: [{ model: PlanFeature, as: 'planFeature', include: [{ model: Feature, as: 'feature' }] }],
      order: [["usage_date", "DESC"]]
    });
    res.json(usage);
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.listBySubscriptionForUser = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const userId = req.user.id;

    const subscription = await Subscription.findOne({ where: { id: subscriptionId, userId } });
    if (!subscription) return res.status(404).json({ message: "Subscription not found" });

    const usage = await Usage.findAll({
      where: { subscriptionId },
      include: [{ model: PlanFeature, as: 'planFeature', include: [{ model: Feature, as: 'feature' }] }],
      order: [["usage_date", "DESC"]]
    });
    res.json(usage);
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};


