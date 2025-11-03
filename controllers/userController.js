const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Get Complete User Data
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user data without password
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        family: user.family,
        birthdate: user.birthdate,
        nationalCode: user.nationalCode,
        mobile: user.mobile,
        email: user.email,
        universityName: user.universityName,
        studentNumber: user.studentNumber,
        fieldOfStudy: user.fieldOfStudy,
        educationalLevel: user.educationalLevel,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching user profile",
      error: error.message,
    });
  }
};

// Edit User Profile
exports.editUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      family,
      birthdate,
      mobile,
      email,
      universityName,
      studentNumber,
      fieldOfStudy,
      educationalLevel,
      password,
      currentPassword,
    } = req.body;

    // Find user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Track what fields are being updated
    const updatedFields = [];

    // Update basic fields
    if (name !== undefined && name.trim() !== "") {
      user.name = name.trim();
      updatedFields.push("name");
    }

    if (family !== undefined && family.trim() !== "") {
      user.family = family.trim();
      updatedFields.push("family");
    }

    if (birthdate !== undefined && birthdate !== "") {
      user.birthdate = birthdate;
      updatedFields.push("birthdate");
    }

    if (universityName !== undefined && universityName.trim() !== "") {
      user.universityName = universityName.trim();
      updatedFields.push("university name");
    }

    if (fieldOfStudy !== undefined && fieldOfStudy.trim() !== "") {
      user.fieldOfStudy = fieldOfStudy.trim();
      updatedFields.push("field of study");
    }

    if (educationalLevel !== undefined && educationalLevel.trim() !== "") {
      user.educationalLevel = educationalLevel.trim();
      updatedFields.push("educational level");
    }

    // Update mobile if provided and different
    if (mobile !== undefined && mobile !== user.mobile) {
      // Check if mobile already exists
      const existingMobile = await User.findOne({
        mobile,
        _id: { $ne: userId },
      });

      if (existingMobile) {
        return res.status(400).json({
          success: false,
          message: "Mobile number already registered",
        });
      }

      user.mobile = mobile;
      updatedFields.push("mobile");
    }

    // Update email if provided and different
    if (email !== undefined && email !== user.email) {
      // Check if email already exists
      const existingEmail = await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: userId },
      });

      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "Email already registered",
        });
      }

      user.email = email.toLowerCase();
      updatedFields.push("email");
    }

    // Update student number if provided and different
    if (studentNumber !== undefined && studentNumber !== user.studentNumber) {
      // Check if student number already exists
      const existingStudentNumber = await User.findOne({
        studentNumber,
        _id: { $ne: userId },
      });

      if (existingStudentNumber) {
        return res.status(400).json({
          success: false,
          message: "Student number already registered",
        });
      }

      user.studentNumber = studentNumber;
      updatedFields.push("student number");
    }

    // Update password if provided
    if (password !== undefined && password.trim() !== "") {
      // Require current password for security
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: "Current password is required to change password",
        });
      }

      // Verify current password
      const isPasswordMatch = await user.comparePassword(currentPassword);

      if (!isPasswordMatch) {
        return res.status(401).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      // Validate new password length
      if (password.trim().length < 6) {
        return res.status(400).json({
          success: false,
          message: "New password must be at least 6 characters",
        });
      }

      user.password = password.trim();
      updatedFields.push("password");
    }

    // Check if any updates were made
    if (updatedFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid updates provided",
      });
    }

    // Save updated user
    await user.save();

    // Get updated user without password
    const updatedUser = await User.findById(userId).select("-password");

    res.status(200).json({
      success: true,
      message: `Profile updated successfully (${updatedFields.join(", ")})`,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        family: updatedUser.family,
        birthdate: updatedUser.birthdate,
        nationalCode: updatedUser.nationalCode,
        mobile: updatedUser.mobile,
        email: updatedUser.email,
        universityName: updatedUser.universityName,
        studentNumber: updatedUser.studentNumber,
        fieldOfStudy: updatedUser.fieldOfStudy,
        educationalLevel: updatedUser.educationalLevel,
        updatedAt: updatedUser.updatedAt,
      },
    });
  } catch (error) {
    console.error("Edit user profile error:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: messages,
      });
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while updating profile",
      error: error.message,
    });
  }
};
