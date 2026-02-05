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
  let { name, description, status, isDeleted } = req.body;

  // Convert Yes/No → boolean
  if (isDeleted !== undefined) {
    if (isDeleted === "Yes") isDeleted = true;
    else if (isDeleted === "No") isDeleted = false;
    else throw new CustomError(400, "isDeleted must be Yes or No");
  }

  // Find the project
  const project = await Project.findById(id);
  if (!project) {
    throw new CustomError(404, "Project not found");
  }

  let updated = false;

  // Check each field for changes before updating
  if (name !== undefined && name !== project.name) {
    project.name = name;
    updated = true;
  }

  if (description !== undefined && description !== project.description) {
    project.description = description;
    updated = true;
  }
  // if status is being updated, validate it and check if it's different from current value
  let ALLOWED_STATUS = ["ACTIVE", "ARCHIVED", "DELETED"];
  if (status !== undefined && status !== project.status && isDeleted !== true) {
    if (!ALLOWED_STATUS.includes(status)) {
      throw new CustomError(400, "Invalid project status");
    }
    if (status === "DELETED") {
      isDeleted = true;
    }
    project.status = status;
    updated = true;
  }
  // If isDeleted is being updated, check if it's different from current value
  if (isDeleted !== undefined && isDeleted !== project.isDeleted) {
    project.isDeleted = isDeleted;

    if (isDeleted === true) {
      project.status = "DELETED";
    } else if (project.status === "DELETED") {
      project.status = "ACTIVE";
    }

    updated = true;
  }

  if (!updated) {
    throw new CustomError(400, "No changes detected");
  }

  await project.save();

  APIResponse.success(res, 200, "Project updated successfully", project);
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
