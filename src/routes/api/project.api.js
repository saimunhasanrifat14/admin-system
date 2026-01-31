const express = require("express");
const router = express.Router();
const { authenticate } = require("../../middlewares/auth.middleware");
const { roleMiddleware } = require("../../middlewares/role.middleware");
const {
  createProject,
  getAllProjects,
  updateProject,
  deleteProject,
} = require("../../controllers/project.controllers");

// Authenticated users
router.route("/create-project").post(authenticate, createProject);
router.route("/get-all-projects").get(authenticate, getAllProjects);

// ADMIN only
router
  .route("/update-project/:id")
  .put(authenticate, roleMiddleware("ADMIN"), updateProject);
router
  .route("/delete-project/:id")
  .delete(authenticate, roleMiddleware("ADMIN"), deleteProject);

module.exports = router;
