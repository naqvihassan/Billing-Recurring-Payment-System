const express = require("express");
const { getUserProfile } = require("../controllers/userController");
const authenticate = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/profile", authenticate, getUserProfile);

router.get("/admin/health", authenticate, requireRole(["admin"]), (req, res) => {
  res.json({ status: "ok", user: req.user });
});

module.exports = router;
