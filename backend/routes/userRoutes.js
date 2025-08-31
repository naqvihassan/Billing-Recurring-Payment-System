const express = require("express");
const router = express.Router();

const { getUserProfile } = require("../controllers/userController");
const authenticate = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/authMiddleware");
const planController = require("../controllers/planController");
const subscriptionController = require("../controllers/subscriptionController");
const usageController = require("../controllers/usageController");
const invoiceApiController = require("../controllers/invoiceApiController");
const transactionController = require("../controllers/transactionController");

const billingSummaryController = require("../controllers/billingSummaryController");
router.get("/billing-summary", authenticate, billingSummaryController.getUserBillingSummary);

router.get("/invoices", authenticate, invoiceApiController.listUserInvoices);
router.get("/invoices/:invoiceId", authenticate, invoiceApiController.getInvoiceDetails);
router.get("/transactions", authenticate, transactionController.getUserTransactions);

router.get("/plans", planController.list);

router.get("/profile", authenticate, getUserProfile);
const { updateUserProfile, changeUserPassword } = require("../controllers/userProfileController");
router.put("/profile", authenticate, updateUserProfile);
router.put("/profile/password", authenticate, changeUserPassword);
router.get("/subscriptions", authenticate, subscriptionController.getUserSubscriptions);
router.get("/subscriptions/:subscriptionId", authenticate, subscriptionController.getSubscriptionDetails);
router.get("/subscriptions/:subscriptionId/usage", authenticate, usageController.listBySubscriptionForUser);
router.post("/subscribe", authenticate, subscriptionController.createSubscription);
router.put("/subscriptions/:subscriptionId/cancel", authenticate, subscriptionController.cancelSubscription);

const ROLES = require('../constants/roles');
router.get("/admin/health", authenticate, requireRole([ROLES.ADMIN]), (req, res) => {
  res.json({ status: "ok", user: req.user });
});

module.exports = router;
