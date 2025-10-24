const User = require("../models/User");
const LoginHistory = require("../models/LoginHistory");
const jwt = require("jsonwebtoken");

// Register User
exports.register = async (req, res) => {
  try {
    const {
      name,
      family,
      birthdate,
      nationalCode,
      mobile,
      email,
      universityName,
      studentNumber,
      fieldOfStudy,
      educationalLevel,
      password,
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ nationalCode }, { email }, { mobile }, { studentNumber }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          "User with this national code, email, mobile, or student number already exists",
      });
    }

    // Create new user
    const user = new User({
      name,
      family,
      birthdate,
      nationalCode,
      mobile,
      email,
      universityName,
      studentNumber,
      fieldOfStudy,
      educationalLevel,
      password,
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, nationalCode: user.nationalCode },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        family: user.family,
        nationalCode: user.nationalCode,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Register error:", error);

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
      message: "Server error during registration",
      error: error.message,
    });
  }
};

// Login User
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide username (national code) and password",
      });
    }

    // Find user by national code
    const user = await User.findOne({ nationalCode: username });

    if (!user) {
      // Log failed login attempt
      await LoginHistory.create({
        user: null,
        nationalCode: username,
        ipAddress: req.clientIp,
        userAgent: req.get("user-agent"),
        loginStatus: "failed",
      });

      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      // Log failed login attempt
      await LoginHistory.create({
        user: user._id,
        nationalCode: username,
        ipAddress: req.clientIp,
        userAgent: req.get("user-agent"),
        loginStatus: "failed",
      });

      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Log successful login
    const loginRecord = await LoginHistory.create({
      user: user._id,
      nationalCode: username,
      ipAddress: req.clientIp,
      userAgent: req.get("user-agent"),
      loginStatus: "success",
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, nationalCode: user.nationalCode },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      ipAddress: req.clientIp,
      user: {
        id: user._id,
        name: user.name,
        family: user.family,
        nationalCode: user.nationalCode,
        email: user.email,
        universityName: user.universityName,
        studentNumber: user.studentNumber,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
      error: error.message,
    });
  }
};
