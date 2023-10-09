const express = require("express");

const router = express.Router();

const {
  getProject,
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} = require("../services/projectService");
const {
  getProjectValidator,
  updateProjectValidator,
  createProjectValidator,
  deleteProjectValidator,
} = require("../utils/validators/projectValidator");

router.route("/").post(createProjectValidator, createProject).get(getProjects);

router
  .route("/:id")
  .put(updateProjectValidator, updateProject)
  .get(getProjectValidator, getProject)
  .delete(deleteProjectValidator, deleteProject);

module.exports = router;
