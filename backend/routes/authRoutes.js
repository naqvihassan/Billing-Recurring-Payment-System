const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
// const authenticate = require("../middleware/authMiddleware");


// This route is now protected
// router.get("/", authenticate, getAllUsers);

// Signup route
router.post("/signup", authController.signup);

// Login route
router.post("/login", authController.login);

module.exports = router;
