// routes/userRoutes.js
const express = require("express");
const { User } = require("../models");

const router = express.Router();

// Create User
router.post("/", async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get All Users
router.get("/", async (req, res) => {
  const users = await User.findAll();
  res.json(users);
});

module.exports = router;
