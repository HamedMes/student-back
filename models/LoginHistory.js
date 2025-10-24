const mongoose = require("mongoose");

const loginHistorySchema = new mongoose.Schema(
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
    ipAddress: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      default: null,
    },
    loginStatus: {
      type: String,
      enum: ["success", "failed"],
      default: "success",
    },
    loginTime: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

loginHistorySchema.index({ user: 1, loginTime: -1 });
loginHistorySchema.index({ nationalCode: 1, loginTime: -1 });

module.exports = mongoose.model("LoginHistory", loginHistorySchema);
