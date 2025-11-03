const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
  {
    teamName: {
      type: String,
      required: [true, "Team name is required"],
      unique: true,
      trim: true,
      minlength: [3, "Team name must be at least 3 characters"],
      maxlength: [50, "Team name must not exceed 50 characters"],
    },
    leader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    leaderNationalCode: {
      type: String,
      required: true,
    },
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        nationalCode: {
          type: String,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        family: {
          type: String,
          required: true,
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    maxMembers: {
      type: Number,
      default: 10,
      min: 1,
      max: 50,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
teamSchema.index({ leader: 1 });
teamSchema.index({ "members.user": 1 });
teamSchema.index({ teamName: 1 });

// Validation: Check if team has reached max members
teamSchema.pre("save", function (next) {
  if (this.members.length > this.maxMembers) {
    return next(
      new Error(`Team cannot have more than ${this.maxMembers} members`)
    );
  }
  next();
});

// Method to check if user is already a member
teamSchema.methods.hasMember = function (userId) {
  return this.members.some(
    (member) => member.user.toString() === userId.toString()
  );
};

// Method to get total team size (leader + members)
teamSchema.methods.getTotalSize = function () {
  return this.members.length + 1; // +1 for leader
};

module.exports = mongoose.model("Team", teamSchema);
