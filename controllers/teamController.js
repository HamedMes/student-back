const Team = require("../models/Team");
const User = require("../models/User");

// Create Team
exports.createTeam = async (req, res) => {
  try {
    const { teamName, memberNationalCodes } = req.body;
    const leaderId = req.user.id; // From auth middleware

    // Validate team name
    if (!teamName) {
      return res.status(400).json({
        success: false,
        message: "Team name is required",
      });
    }

    // Check if leader already exists in any team (as leader or member)
    const existingTeamAsLeader = await Team.findOne({ leader: leaderId });
    if (existingTeamAsLeader) {
      return res.status(400).json({
        success: false,
        message: "You already have a team. You cannot create another team.",
      });
    }

    const existingTeamAsMember = await Team.findOne({
      "members.user": leaderId,
    });
    if (existingTeamAsMember) {
      return res.status(400).json({
        success: false,
        message:
          "You are already a member of another team. You cannot create a new team.",
      });
    }

    // Check if team name already exists
    const existingTeamName = await Team.findOne({ teamName });
    if (existingTeamName) {
      return res.status(400).json({
        success: false,
        message: "Team name already exists. Please choose another name.",
      });
    }

    // Get leader info
    const leader = await User.findById(leaderId);
    if (!leader) {
      return res.status(404).json({
        success: false,
        message: "Leader not found",
      });
    }

    // Initialize members array
    const members = [];

    // Add members if provided
    if (
      memberNationalCodes &&
      Array.isArray(memberNationalCodes) &&
      memberNationalCodes.length > 0
    ) {
      // Remove duplicates
      const uniqueNationalCodes = [...new Set(memberNationalCodes)];

      // Check if leader's national code is in members list
      if (uniqueNationalCodes.includes(leader.nationalCode)) {
        return res.status(400).json({
          success: false,
          message: "Leader cannot be added as a member",
        });
      }

      // Find all users by national codes
      const users = await User.find({
        nationalCode: { $in: uniqueNationalCodes },
      });

      if (users.length !== uniqueNationalCodes.length) {
        const foundCodes = users.map((u) => u.nationalCode);
        const notFoundCodes = uniqueNationalCodes.filter(
          (code) => !foundCodes.includes(code)
        );
        return res.status(404).json({
          success: false,
          message: "Some users not found",
          notFoundNationalCodes: notFoundCodes,
        });
      }

      // Check if any user is already in a team
      for (const user of users) {
        const userInTeam = await Team.findOne({
          $or: [{ leader: user._id }, { "members.user": user._id }],
        });

        if (userInTeam) {
          return res.status(400).json({
            success: false,
            message: `User with national code ${user.nationalCode} is already in team "${userInTeam.teamName}"`,
          });
        }
      }

      // Add users to members array
      users.forEach((user) => {
        members.push({
          user: user._id,
          nationalCode: user.nationalCode,
          name: user.name,
          family: user.family,
        });
      });
    }

    // Create team
    const team = new Team({
      teamName,
      leader: leaderId,
      leaderNationalCode: leader.nationalCode,
      members,
    });

    await team.save();

    // Populate the team with full details
    await team.populate("leader", "name family nationalCode email");

    res.status(201).json({
      success: true,
      message: "Team created successfully",
      team: {
        id: team._id,
        teamName: team.teamName,
        leader: {
          id: team.leader._id,
          name: team.leader.name,
          family: team.leader.family,
          nationalCode: team.leader.nationalCode,
        },
        members: team.members.map((m) => ({
          nationalCode: m.nationalCode,
          name: m.name,
          family: m.family,
          joinedAt: m.joinedAt,
        })),
        totalMembers: team.getTotalSize(),
        createdAt: team.createdAt,
      },
    });
  } catch (error) {
    console.error("Create team error:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: messages,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while creating team",
      error: error.message,
    });
  }
};

// Edit Team (Members and Name)
exports.editTeam = async (req, res) => {
  try {
    const { teamName, memberNationalCodes } = req.body;
    const leaderId = req.user.id; // From auth middleware

    // Find team by leader
    const team = await Team.findOne({ leader: leaderId });

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "You do not have a team. Only team leaders can edit team.",
      });
    }

    let updateMessage = [];

    // Update team name if provided
    if (teamName !== undefined && teamName !== null) {
      const trimmedTeamName = teamName.trim();

      if (trimmedTeamName.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Team name cannot be empty",
        });
      }

      // Check if new team name is different from current
      if (trimmedTeamName !== team.teamName) {
        // Check if team name already exists
        const existingTeamName = await Team.findOne({
          teamName: trimmedTeamName,
          _id: { $ne: team._id }, // Exclude current team
        });

        if (existingTeamName) {
          return res.status(400).json({
            success: false,
            message: "Team name already exists. Please choose another name.",
          });
        }

        team.teamName = trimmedTeamName;
        updateMessage.push("team name");
      }
    }

    // Update members if provided
    if (memberNationalCodes !== undefined) {
      // Validate input
      if (!Array.isArray(memberNationalCodes)) {
        return res.status(400).json({
          success: false,
          message: "memberNationalCodes must be an array",
        });
      }

      // Get leader info
      const leader = await User.findById(leaderId);

      // Remove duplicates
      const uniqueNationalCodes = [...new Set(memberNationalCodes)];

      // Check if leader's national code is in members list
      if (uniqueNationalCodes.includes(leader.nationalCode)) {
        return res.status(400).json({
          success: false,
          message: "Leader cannot be added as a member",
        });
      }

      // If empty array, remove all members
      if (uniqueNationalCodes.length === 0) {
        team.members = [];
        updateMessage.push("members");
      } else {
        // Find all users by national codes
        const users = await User.find({
          nationalCode: { $in: uniqueNationalCodes },
        });

        if (users.length !== uniqueNationalCodes.length) {
          const foundCodes = users.map((u) => u.nationalCode);
          const notFoundCodes = uniqueNationalCodes.filter(
            (code) => !foundCodes.includes(code)
          );
          return res.status(404).json({
            success: false,
            message: "Some users not found",
            notFoundNationalCodes: notFoundCodes,
          });
        }

        // Check if any user is already in another team
        for (const user of users) {
          const userInTeam = await Team.findOne({
            _id: { $ne: team._id }, // Exclude current team
            $or: [{ leader: user._id }, { "members.user": user._id }],
          });

          if (userInTeam) {
            return res.status(400).json({
              success: false,
              message: `User with national code ${user.nationalCode} is already in team "${userInTeam.teamName}"`,
            });
          }
        }

        // Check max members limit
        if (users.length > team.maxMembers) {
          return res.status(400).json({
            success: false,
            message: `Team cannot have more than ${team.maxMembers} members`,
          });
        }

        // Update members array
        team.members = users.map((user) => ({
          user: user._id,
          nationalCode: user.nationalCode,
          name: user.name,
          family: user.family,
          joinedAt: new Date(),
        }));
        updateMessage.push("members");
      }
    }

    // Check if any updates were made
    if (updateMessage.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "No updates provided. Please provide teamName or memberNationalCodes to update.",
      });
    }

    await team.save();
    await team.populate("leader", "name family nationalCode email");

    const message = `Team ${updateMessage.join(" and ")} updated successfully`;

    res.status(200).json({
      success: true,
      message,
      team: {
        id: team._id,
        teamName: team.teamName,
        leader: {
          id: team.leader._id,
          name: team.leader.name,
          family: team.leader.family,
          nationalCode: team.leader.nationalCode,
        },
        members: team.members.map((m) => ({
          nationalCode: m.nationalCode,
          name: m.name,
          family: m.family,
          joinedAt: m.joinedAt,
        })),
        totalMembers: team.getTotalSize(),
        updatedAt: team.updatedAt,
      },
    });
  } catch (error) {
    console.error("Edit team error:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: messages,
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Team name already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while editing team",
      error: error.message,
    });
  }
};

// Get My Team (for both leader and members)
exports.getMyTeam = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find team where user is leader or member
    const team = await Team.findOne({
      $or: [{ leader: userId }, { "members.user": userId }],
    }).populate("leader", "name family nationalCode email");

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "You are not in any team",
      });
    }

    const isLeader = team.leader._id.toString() === userId.toString();

    res.status(200).json({
      success: true,
      team: {
        id: team._id,
        teamName: team.teamName,
        isLeader,
        leader: {
          id: team.leader._id,
          name: team.leader.name,
          family: team.leader.family,
          nationalCode: team.leader.nationalCode,
        },
        members: team.members.map((m) => ({
          nationalCode: m.nationalCode,
          name: m.name,
          family: m.family,
          joinedAt: m.joinedAt,
        })),
        totalMembers: team.getTotalSize(),
        createdAt: team.createdAt,
        updatedAt: team.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get my team error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching team",
      error: error.message,
    });
  }
};
