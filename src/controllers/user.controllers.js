const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const { APIResponse } = require("../utilities/APIResponse");
const { AsyncHandler } = require("../utilities/AsyncHandler");
const { CustomError } = require("../utilities/CustomError");
const Invite = require("../models/invite.model");

exports.RegisterViaInvite = AsyncHandler(async (req, res) => {
  const { token, name, password } = req.body;

  // Validate input
  if (!token || !name || !password) {
    throw new CustomError(400, "All fields are required");
  }

  // Find invite
  const invite = await Invite.findOne({ token });
  if (!invite) throw new CustomError(400, "Invalid invite token");

  // Check invite validity
  if (invite.expiresAt < new Date())
    throw new CustomError(400, "Invite expired");

  // Check if already accepted
  if (invite.acceptedAt) throw new CustomError(400, "Invite already used");

  // Check if user already exists
  const existingUser = await User.findOne({ email: invite.email });
  if (existingUser) throw new CustomError(400, "User already exists");

  // Create user
  await User.create({
    name,
    email: invite.email,
    password,
    role: invite.role,
    invitedAt: new Date(),
  });

  // Mark invite as accepted
  invite.acceptedAt = new Date();
  await invite.save();

  // Respond
  APIResponse.success(res, 201, "Registration successful, Now you can log in", {
    email: invite.email,
    name: name,
    role: invite.role,
  });
});

exports.Login = AsyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new CustomError(400, "Email and password required");
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new CustomError(400, "Invalid credentials");
  }

  if (user.status === "INACTIVE") {
    throw new CustomError(403, "Account is deactivated. Contact admin.");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new CustomError(400, "Invalid credentials");
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save();


  const isProduction = process.env.NODE_ENV === "production";
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  };

  res.cookie("accessToken", accessToken, cookieOptions);
  res.cookie("refreshToken", refreshToken, cookieOptions);

  // NO TOKEN IN RESPONSE BODY
  APIResponse.success(res, 200, "Login successful", {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

exports.editUser = AsyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { role, status } = req.body;

  // Prevent self update (role or status)
  if (req.user._id.toString() === userId) {
    throw new CustomError(403, "You cannot update your own role or status");
  }

  // Find user
  const user = await User.findById(userId);
  if (!user) {
    throw new CustomError(404, "User not found");
  }

  // Validate & update role (if provided)
  if (role) {
    const allowedRoles = ["ADMIN", "MANAGER", "STAFF"];
    if (!allowedRoles.includes(role)) {
      throw new CustomError(400, "Invalid role");
    }
    user.role = role;
  }

  // Validate & update status (if provided)
  if (status) {
    const allowedStatus = ["ACTIVE", "INACTIVE"];
    if (!allowedStatus.includes(status)) {
      throw new CustomError(400, "Invalid status");
    }
    user.status = status;
  }

  // If nothing to update
  if (!role && !status) {
    throw new CustomError(400, "Nothing to update");
  }

  await user.save();

  APIResponse.success(res, 200, "User updated successfully", {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
  });
});


exports.getAllUsers = async (req, res) => {
  const users = await User.find().select("-password -refreshToken");

  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
};

exports.getMe = async (req, res, next) => {
  try {
    // req.user is set by authMiddleware
    if (!req.user) {
      throw new CustomError(401, "Not authenticated");
    }

    APIResponse.success(res, 200, "User info retrieved successfully", {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      status: req.user.status,
    });
  } catch (err) {
    next(err);
  }
};