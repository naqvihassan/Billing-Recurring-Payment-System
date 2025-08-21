const { Feature } = require("../models");

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


