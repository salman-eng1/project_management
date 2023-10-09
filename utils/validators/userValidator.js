const { check, body } = require("express-validator");
const slugify = require("slugify");
const bcrypt = require("bcryptjs");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const User = require("../../models/userModel");
//validation process will get the id from the request as calrified in the following rule

exports.getUserValidator = [
  check("id").isMongoId().withMessage("invalid user id"),
  validatorMiddleware,
];

exports.createUserValidator = [
  check("name")
    .notEmpty()
    .withMessage("user name required")
    .isLength({ min: 3 })
    .withMessage("Too short user name")
    .isLength({ max: 32 })
    .withMessage("Too long user name")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true; //if the validation is passed
    }),
  check("email")
    .notEmpty()
    .withMessage("Email required")
    .isEmail()
    .withMessage("invalid Email address")
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error("email already exists"));
        }
      })
    ),
  check("password")
    .notEmpty()
    .withMessage("user password required")
    .isLength({ min: 6 })
    .withMessage("user password must be at least 6 characters")
    .custom((password, { req }) => {
      if (password !== req.body.passwordConfirm) {
        throw new Error("password information incorrect");
      }
      return true;
    }),
  check("passwordConfirm")
    .notEmpty()
    .withMessage("password confirmation is required"),

  check("profileImg").optional(),
  check("role").optional(),

  check("phone")
    .optional()
    .isMobilePhone(["ar-SY", "ar-EG"])
    .withMessage("invalid phone number, only egypt and syria are allowed"),
  validatorMiddleware,
];

exports.updateUserValidator = [
  check("id").isMongoId().withMessage("invalid user id"),
  body("name")
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true; //if the validation is passed
    }),
  check("email")
    .notEmpty()
    .withMessage("Email required")
    .isEmail()
    .withMessage("invalid Email address")
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error("email already exists"));
        }
      })
    ),
  check("profileImg").optional(),
  check("role").optional(),

  check("phone")
    .optional()
    .isMobilePhone(["ar-SY", "ar-EG"])
    .withMessage("invalid phone number, only egypt and syria are allowed"),
  validatorMiddleware,
 ];
exports.changeUserPasswordValidator = [
  check("id").notEmpty().withMessage("user id is required"),
  body("currentPassword")
    .notEmpty()
    .withMessage("current password must not be empty"),
  body("confirmPassword")
    .notEmpty()
    .withMessage("confirm password must not be empty"),
  body("password")
    .notEmpty()
    .withMessage("password must not be empty")
    .custom(async (val, { req }) => {
      //verify current password
      const user = await User.findById(req.params.id);
      if (!user) {
        throw new Error("there is no user for this id");
      }
      const isCorrectPassword = await bcrypt.compare(
        req.body.currentPassword,
        user.password
      );
      if (!isCorrectPassword) {
        throw new Error("Incorrect current password");
      }

      // verify password confirm
      if (val !== req.body.confirmPassword) {
        throw new Error("password information incorrect");
      }
      return true;
    }),
  validatorMiddleware,
];
exports.deleteUserValidator = [
  check("id").isMongoId().withMessage("invalid user id"),
  validatorMiddleware,
];
