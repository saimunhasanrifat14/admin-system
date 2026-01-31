const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const { CustomError } = require("../utilities/CustomError");

exports.authMiddleware = async (req, res, next) => {
  try {
    // Get access token
    const accessToken = req.cookies?.accessToken;
    if (!accessToken) {
      return next(new CustomError(401, "Authentication required"));
    }
    
    // Verify token
    const decoded = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    );

    // Find user
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return next(new CustomError(401, "User not found"));
    }

    // Check if user is active
    if (user.status !== "ACTIVE") {
      return next(new CustomError(403, "Account is inactive"));
    }

    req.user = user;
    next();
  } catch (error) {
    next(new CustomError(401, "Invalid or expired access token"));
  }
};
