const Project = require("../models/project.model");
const { APIResponse } = require("../utilities/APIResponse");
const { AsyncHandler } = require("../utilities/AsyncHandler");
const { CustomError } = require("../utilities/CustomError");

exports.createProject = AsyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name || !description) {
    throw new CustomError(400, "Project name and description are required");
  }

  const project = await Project.create({
    name,
    description,
    createdBy: req.user._id,
  });

  APIResponse.success(res, 201, "Project created successfully", project);
});

exports.getAllProjects = AsyncHandler(async (req, res) => {
  const projects = await Project.find({
    isDeleted: false,
  }).populate("createdBy", "name email role");

  APIResponse.success(res, 200, "Projects retrieved successfully", {
    success: true,
    count: projects.length,
    data: projects,
  });
});

exports.updateProject = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, status } = req.body;

  const project = await Project.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!project) {
    throw new CustomError(404, "Project not found");
  }

  if (name) project.name = name;
  if (description) project.description = description;
  if (status) {
    if (!ALLOWED_STATUS.includes(status)) {
      throw new CustomError(400, "Invalid project status");
    }
    project.status = status;
  }

  await project.save();

  APIResponse.success(res, 200, "Project updated successfully", project);
});

exports.deleteProject = AsyncHandler(async (req, res) => {
  const { id } = req.params;

  const project = await Project.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!project) {
    throw new CustomError(404, "Project not found");
  }

  project.isDeleted = true;
  project.status = "DELETED";
  await project.save();

  APIResponse.success(res, 200, "Project deleted successfully", project);
});

exports.getDeletedProjects = AsyncHandler(async (req, res) => {
  const projects = await Project.find({ isDeleted: true }).populate(
    "createdBy",
    "name email role",
  );

  APIResponse.success(res, 200, "Deleted projects retrieved successfully", {
    success: true,
    count: projects.length,
    data: projects,
  });
});
