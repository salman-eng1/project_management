const express = require("express");

const router = express.Router();
const {
  signupValidator,
  loginValidator,
} = require("../utils/validators/authValidator");
const {
  signup,
  login,
  forgetPassword,
  logout,
} = require("../services/authService");

router.post("/signup", signupValidator, signup);

router.post("/login", loginValidator, login);
router.put("/logout/:id", logout);

router.post("/forgetPassword",forgetPassword);

module.exports = router;
