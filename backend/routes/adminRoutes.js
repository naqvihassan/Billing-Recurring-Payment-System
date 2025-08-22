const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/authMiddleware");

const featureController = require("../controllers/featureController");
const planController = require("../controllers/planController");
const subscriptionController = require("../controllers/subscriptionController");
const usageController = require("../controllers/usageController");

router.use(authenticate);
router.use(requireRole(["admin"]));

router.get("/features", featureController.list);
router.post("/features", featureController.create);
router.put("/features/:id", featureController.update);
router.delete("/features/:id", featureController.remove);

router.get("/plans", planController.list);
router.post("/plans", planController.create);
router.put("/plans/:id", planController.update);
router.delete("/plans/:id", planController.remove);

router.get("/subscriptions", subscriptionController.getAllSubscriptions);
router.get("/subscriptions/:subscriptionId", subscriptionController.getSubscriptionById);

router.post("/usage", usageController.create);
router.get("/subscriptions/:subscriptionId/usage", usageController.listBySubscription);

module.exports = router;


