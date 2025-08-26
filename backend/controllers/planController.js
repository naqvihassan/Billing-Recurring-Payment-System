const { Plan, Feature, PlanFeature, Subscription } = require("../models");

exports.list = async (req, res) => {
  try {
    const plans = await Plan.findAll({
      include: [{ model: Feature, through: { attributes: [] } }],
      order: [["createdAt", "DESC"]],
    });
    res.json(plans);
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, monthlyFee, features } = req.body;
    if (!name || monthlyFee == null) return res.status(400).json({ message: "Missing fields" });
    const plan = await Plan.create({ name, monthlyFee });
    if (Array.isArray(features) && features.length) {
      for (const featureId of features) {
        await PlanFeature.create({
          planId: plan.id,
          featureId: featureId,
        });
      }
    }
    const withFeatures = await Plan.findByPk(plan.id, { include: [{ model: Feature }] });
    res.status(201).json(withFeatures);
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, monthlyFee, features } = req.body;

    const plan = await Plan.findByPk(id, { include: [{ model: Feature }] });
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    if (name != null) plan.name = name;
    if (monthlyFee != null) plan.monthlyFee = monthlyFee;
    await plan.save();

    if (Array.isArray(features)) {
      const currentFeatureIds = new Set((plan.Features || []).map((f) => f.id));
      const newFeatureIds = new Set(features);

      for (const featureId of newFeatureIds) {
        if (!currentFeatureIds.has(featureId)) {
          await PlanFeature.create({ planId: plan.id, featureId });
        }
      }

      for (const featureId of currentFeatureIds) {
        if (!newFeatureIds.has(featureId)) {
          await PlanFeature.destroy({ where: { planId: plan.id, featureId } });
        }
      }
    }

    const updated = await Plan.findByPk(plan.id, {
      include: [{ model: Feature, through: { attributes: [] } }],
    });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await Plan.findByPk(id);
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    const activeSubs = await Subscription.count({ where: { planId: id, status: 'active' } });
    if (activeSubs > 0) {
      return res.status(400).json({ message: "Cannot delete a plan with active subscribers" });
    }

    await PlanFeature.destroy({ where: { planId: id } });
    await plan.destroy();
    res.json({ message: "Plan deleted" });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};
