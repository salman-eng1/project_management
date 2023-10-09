const { check } = require("express-validator");
const slugify = require("slugify");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const User = require("../../models/userModel");
//validation process will get the id from the request as calrified in the following rule

exports.signupValidator = [
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

  validatorMiddleware,
];

exports.loginValidator = [
  check("email")
    .notEmpty()
    .withMessage("Email required")
    .isEmail()
    .withMessage("invalid Email address"),

  check("password")
    .notEmpty()
    .withMessage("user password required")
    .isLength({ min: 6 })
    .withMessage("user password must be at least 6 characters"),

  validatorMiddleware,
];
