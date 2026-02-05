const express = require('express');
const router = express.Router();
const {authMiddleware} = require('../../middlewares/auth.middleware');
const {roleMiddleware} = require('../../middlewares/role.middleware');
const {
  createProject,
  getAllProjects,
  updateProject,
} = require('../../controllers/project.controllers');

// Authenticated users
router.route('/create-project').post(authMiddleware, createProject);
router.route('/get-all-projects').get(authMiddleware, getAllProjects);

// ADMIN only
router
  .route('/update-project/:id')
  .put(authMiddleware, roleMiddleware('ADMIN'), updateProject);

module.exports = router;
