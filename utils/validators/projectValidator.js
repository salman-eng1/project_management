const { body, check } = require("express-validator");
const slugify = require("slugify");

const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const Project = require("../../models/projectModel");

exports.getProjectValidator = [
  check("id").isMongoId().withMessage("invalid project id"),
  validatorMiddleware,
];

exports.createProjectValidator = [
  check("name")
    .notEmpty()
    .withMessage("name is required")
    .isLength({ max: 32 })
    .withMessage("name is too long")
    .custom(async (val, { req }) => {
      req.body.slug = slugify(val);
      const oldPro = await Project.findOne({ name: val });
      if (oldPro) {
        return Promise.reject(new Error("name existed"));
      }
    }),
  check("description")
    .optional()
    .isLength({ max: 50 })
    .withMessage("too long description"),
  check("country").notEmpty().withMessage("country is required"),
  check("location").notEmpty().withMessage("location is required"),
  validatorMiddleware,
];

exports.updateProjectValidator = [
  check("name")
    .notEmpty()
    .withMessage("name is required")
    .isLength({ max: 32 })
    .withMessage("name is too long")
    .custom(async (val, { req }) => {
      req.body.slug = slugify(val);
      const oldPro = await Project.findOne({ name: val });
      if (oldPro) {
        return Promise.reject(new Error("name existed"));
      }
    }),
  check("description")
    .optional()
    .isLength({ max: 50 })
    .withMessage("too long description"),
  validatorMiddleware,
];

exports.deleteProjectValidator = [
  check("id").isMongoId().withMessage("invalid project id"),
  validatorMiddleware,
];
