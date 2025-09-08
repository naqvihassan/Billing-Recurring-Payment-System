const { Feature, PlanFeature, Subscription, Plan } = require("../models");

exports.list = async (req, res) => {
  try {
    const features = await Feature.findAll({ order: [["createdAt", "DESC"]] });
    res.json(features);
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, code, unit_price, max_unit_limit } = req.body;
    if (!name || !code || unit_price == null || max_unit_limit == null) {
      return res.status(400).json({ message: "Missing fields" });
    }
    const existing = await Feature.findOne({ where: { code } });
    if (existing) return res.status(400).json({ message: "Feature code exists" });
    const feature = await Feature.create({ name, code, unit_price, max_unit_limit });
    res.status(201).json(feature);
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, unit_price, max_unit_limit } = req.body;
    const feature = await Feature.findByPk(id);
    if (!feature) return res.status(404).json({ message: "Feature not found" });

    if (name != null) feature.name = name;
    if (unit_price != null) feature.unit_price = unit_price;
    if (max_unit_limit != null) feature.max_unit_limit = max_unit_limit;
    await feature.save();

    res.json(feature);
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const feature = await Feature.findByPk(id);
    if (!feature) return res.status(404).json({ message: "Feature not found" });

    const planFeatures = await PlanFeature.findAll({ where: { featureId: id } });
    if (planFeatures.length > 0) {
      const planIds = [...new Set(planFeatures.map((pf) => pf.planId))];
      const activePlanWithSubs = await Subscription.count({ where: { planId: planIds, status: 'active' } });
      if (activePlanWithSubs > 0) {
        return res.status(400).json({ message: "Cannot delete feature used by plans with active subscribers" });
      }
    }
    await PlanFeature.destroy({ where: { featureId: id } });
    await feature.destroy();
    res.json({ message: "Feature deleted" });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};
