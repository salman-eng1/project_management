const Project = require("../models/projectModel");
const factory = require("./handlerFactory");


exports.getProjects = factory.getAll(Project)


exports.getProject = factory.getOne(Project)


exports.createProject = factory.createOne(Project)

exports.updateProject = factory.updateOne(Project)

exports.deleteProject =factory.deleteOne(Project)

