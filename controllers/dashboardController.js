const User = require("../models/User");
const Team = require("../models/Team");

// Get Dashboard Data
exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user data
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Calculate days since registration
    const registrationDate = user.createdAt;
    const currentDate = new Date();
    const timeDiff = currentDate - registrationDate;
    const daysSinceRegistration = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    // Find user's team (as leader or member)
    const team = await Team.findOne({
      $or: [{ leader: userId }, { "members.user": userId }],
    })
      .populate("leader", "name family nationalCode")
      .populate("members.user", "name family universityName");

    let teamData = null;

    if (team) {
      const isLeader = team.leader._id.toString() === userId.toString();

      // Prepare team members data with university name
      const teamMembers = team.members.map((member) => ({
        id: member.user._id,
        name: member.user.name,
        family: member.user.family,
        universityName: member.user.universityName,
      }));

      teamData = {
        teamName: team.teamName,
        isLeader,
        members: teamMembers,
        totalMembers: team.getTotalSize(),
      };
    }

    res.status(200).json({
      success: true,
      dashboard: {
        user: {
          id: user._id,
          name: user.name,
          family: user.family,
        },
        daysSinceRegistration,
        team: teamData,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching dashboard data",
      error: error.message,
    });
  }
};
