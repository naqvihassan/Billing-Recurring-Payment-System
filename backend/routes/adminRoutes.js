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

router.get("/plans", planController.list);
router.post("/plans", planController.create);

module.exports = router;


