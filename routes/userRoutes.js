const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

// @route   GET /api/users/profile
// @desc    Get complete user profile data
// @access  Private
router.get("/profile", protect, userController.getUserProfile);

// @route   PUT /api/users/profile
// @desc    Edit user profile data (including password)
// @access  Private
router.put("/profile", protect, userController.editUserProfile);

module.exports = router;
