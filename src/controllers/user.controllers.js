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

  // Validate input
  if (!email || !password)
    throw new CustomError(400, "Email and password required");

  // Find user
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new CustomError(400, "Invalid credentials");

  // Check password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new CustomError(400, "Invalid credentials");

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // Save refresh token in DB
  user.refreshToken = refreshToken;
  await user.save();

   // SET COOKIE
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  // Respond with tokens
  APIResponse.success(res, 200, "Login successful", {
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});
