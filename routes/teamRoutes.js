const express = require("express");
const router = express.Router();
const teamController = require("../controllers/teamController");
const { protect } = require("../middleware/authMiddleware");

// All routes are protected (require authentication)

// @route   POST /api/teams/create
// @desc    Create a new team (leader only)
// @access  Private
router.post("/create", protect, teamController.createTeam);

// @route   PUT /api/teams/edit
// @desc    Edit team name and/or members (leader only)
// @access  Private
router.put("/edit", protect, teamController.editTeam);

// @route   GET /api/teams/my-team
// @desc    Get my team information
// @access  Private
router.get("/my-team", protect, teamController.getMyTeam);

module.exports = router;
