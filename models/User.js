const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    family: {
      type: String,
      required: [true, "Family is required"],
      trim: true,
    },
    birthdate: {
      type: Date,
      required: [true, "Birthdate is required"],
    },
    nationalCode: {
      type: String,
      required: [true, "National code is required"],
      unique: true,
      match: [/^\d{10}$/, "National code must be exactly 10 digits"],
    },
    mobile: {
      type: String,
      required: [true, "Mobile is required"],
      unique: true,
      match: [/^\d{11}$/, "Mobile must be exactly 11 digits"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    universityName: {
      type: String,
      required: [true, "University name is required"],
      trim: true,
    },
    studentNumber: {
      type: String,
      required: [true, "Student number is required"],
      unique: true,
      trim: true,
    },
    fieldOfStudy: {
      type: String,
      required: [true, "Field of study is required"],
      trim: true,
    },
    educationalLevel: {
      type: String,
      required: [true, "Educational level is required"],
      enum: ["Associate", "Bachelor", "Master", "PhD"],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
