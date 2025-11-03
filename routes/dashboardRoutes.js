const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const { protect } = require("../middleware/authMiddleware");

// @route   GET /api/dashboard
// @desc    Get dashboard data (user info, team members, days since registration)
// @access  Private
router.get("/", protect, dashboardController.getDashboard);

module.exports = router;
