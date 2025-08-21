const { Plan, Feature, PlanFeature } = require("../models");

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
      for (const f of features) {
        if (!f.featureId || f.included_units == null) continue;
        await PlanFeature.create({
          planId: plan.id,
          featureId: f.featureId,
          included_units: f.included_units,
          overage_unit_price: f.overage_unit_price ?? null,
        });
      }
    }
    const withFeatures = await Plan.findByPk(plan.id, { include: [{ model: Feature }] });
    res.status(201).json(withFeatures);
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};


