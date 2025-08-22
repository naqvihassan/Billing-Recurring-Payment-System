const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/authMiddleware");

const featureController = require("../controllers/featureController");
const planController = require("../controllers/planController");

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

module.exports = router;


