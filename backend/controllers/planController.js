const { Plan, Feature, PlanFeature, Subscription, Usage } = require("../models");

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

      // Add new relations first
      for (const featureId of newFeatureIds) {
        if (!currentFeatureIds.has(featureId)) {
          await PlanFeature.create({ planId: plan.id, featureId });
        }
      }

      // Attempt removals while protecting features that have usage
      const failedFeatureRemovals = [];
      for (const featureId of currentFeatureIds) {
        if (!newFeatureIds.has(featureId)) {
          const planFeature = await PlanFeature.findOne({ where: { planId: plan.id, featureId } });
          if (planFeature) {
            const usageCount = await Usage.count({ where: { planFeatureId: planFeature.id } });
            if (usageCount > 0) {
              const featureRecord = await Feature.findByPk(featureId);
              failedFeatureRemovals.push({
                featureId,
                featureName: featureRecord?.name,
                featureCode: featureRecord?.code,
                reason: 'Feature has recorded usage and cannot be removed.'
              });
              continue;
            }
            await PlanFeature.destroy({ where: { id: planFeature.id } });
          }
        }
      }

      // Attach warnings on response if any removals failed
      if (failedFeatureRemovals.length > 0) {
        req._planUpdateWarnings = { failedFeatureRemovals };
      }
    }

    const updated = await Plan.findByPk(plan.id, {
      include: [{ model: Feature, through: { attributes: [] } }],
    });
    if (req._planUpdateWarnings) {
      return res.json({ plan: updated, warnings: req._planUpdateWarnings });
    }
    res.json({ plan: updated });
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
