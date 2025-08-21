const express = require("express");
const { getUserProfile } = require("../controllers/userController");
const authenticate = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/authMiddleware");
const planController = require("../controllers/planController");
const subscriptionController = require("../controllers/subscriptionController");

const router = express.Router();

router.get("/plans", planController.list);

router.get("/profile", authenticate, getUserProfile);
router.get("/subscriptions", authenticate, subscriptionController.getUserSubscriptions);
router.post("/subscribe", authenticate, subscriptionController.createSubscription);
router.put("/subscriptions/:subscriptionId/cancel", authenticate, subscriptionController.cancelSubscription);

router.get("/admin/health", authenticate, requireRole(["admin"]), (req, res) => {
  res.json({ status: "ok", user: req.user });
});

module.exports = router;
