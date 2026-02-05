const express = require("express");
const crypto = require("crypto");
const Invite = require("../models/invite.model");
const User = require("../models/user.model");
const { APIResponse } = require("../utilities/APIResponse");
const { AsyncHandler } = require("../utilities/AsyncHandler");
const { CustomError } = require("../utilities/CustomError");
const { emailSend } = require("../helper/EmailSender");

exports.CreateInvite = AsyncHandler(async (req, res) => {
  const { email, role } = req.body;

  // Validate input
  if (!email || !role) {
    throw new CustomError(400, "Email and role are required");
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new CustomError(500, "User already exists");
  }

  // Check if an active invite already exists
  const IsInviteAlreadyExists = await Invite.findOne({
    email,
    acceptedAt: null,
    expiresAt: { $gt: new Date() },
  });
  if (IsInviteAlreadyExists) {
    throw new CustomError(400, "Invite already exists for this email");
  }

  // Create invite
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await Invite.create({
    email,
    role,
    token,
    expiresAt,
  });

  // Send invite email
  await emailSend(
    email,
    "<h1>Welcome</h1><p>Your invite is ready use the link below</p> <a href='http://localhost:5173/register?token=" +
      token +
      "'>Complete Registration</a>",
    "You're invited to join"
  );

  // Respond
  APIResponse.success(res, 201, "Invite created", {
    // inviteLink: `${process.env.FRONTEND_URL}/register?token=${token}`,
    inviteLink: `http://localhost:5173/register?token=${token}`,
  });
});

exports.VerifyInviteToken = AsyncHandler(async (req, res) => {
  const { token } = req.body;

  // Validate input
  if (!token) {
    throw new CustomError(400, "Invite token is required");
  }

  // Find invite by token
  const invite = await Invite.findOne({ token });
  if (!invite) {
    throw new CustomError(400, "Invalid invite token");
  }

  // Expired
  if (invite.expiresAt < new Date()) {
    throw new CustomError(400, "Invite token has expired");
  }

  // Already used
  if (invite.acceptedAt) {
    throw new CustomError(400, "Invite token already used");
  }

  // respond
  APIResponse.success(res, 200, "Invite token is valid", {
    email: invite.email,
    role: invite.role,
  });
});
