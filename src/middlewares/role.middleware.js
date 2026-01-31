const { CustomError } = require("../utilities/CustomError");

exports.roleMiddleware = (...allowedRole) => {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      throw new CustomError(401, "Authentication required");
    }
    // Check role
    if (!allowedRole.includes(req.user.role)) {
      throw new CustomError(403, "Access denied");
    }
    next();
  };
};
