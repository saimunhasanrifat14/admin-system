const express = require("express");
const router = express.Router();
const {
  RegisterViaInvite,
  Login,
  getAllUsers,
  editUser,
  getMe,
  logout,
} = require("../../controllers/user.controllers");
const { authMiddleware } = require("../../middlewares/auth.middleware");
const { roleMiddleware } = require("../../middlewares/role.middleware");

router.route("/register-via-invite").post(RegisterViaInvite);
router.route("/login").post(Login);
router
  .route("/edit-user/:userId")
  .patch(authMiddleware, roleMiddleware("ADMIN"), editUser);

router.route("/users").get(getAllUsers);
router.route("/me").get(authMiddleware, getMe);

router.route("/logout").post(authMiddleware, logout);

module.exports = router;
