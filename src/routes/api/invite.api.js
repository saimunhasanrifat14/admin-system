const express = require("express");
const router = express.Router();
const {
  CreateInvite,
  VerifyInviteToken,
} = require("../../controllers/Invite.controllers");
const { roleMiddleware } = require("../../middlewares/role.middleware");
const { authMiddleware } = require("../../middlewares/auth.middleware");

router
  .route("/create-invite")
  .post(authMiddleware, roleMiddleware("ADMIN"), CreateInvite);
router.route("/verify-invite-token").post(VerifyInviteToken);
module.exports = router;
