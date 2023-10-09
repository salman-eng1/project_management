const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const { createHmac } = require("node:crypto");

const bcrypt = require("bcryptjs");
const sendEmail = require("../utils/sendEmail");
const ApiError = require("../utils/apiError");
const User = require("../models/userModel");

const createToken = (payload) =>
  jwt.sign({ userId: payload }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE_TIME,
  });

exports.signup = asyncHandler(async (req, res, next) => {
  //1- create user
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });

  //2- Generate token
  const token = createToken(user._id);
  res.status(201).json({ data: user, token });
});

exports.login = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new ApiError("Invalid Credentials", 401));
  }
  const token = createToken(user._id);
  user.loginAt = Date.now();
  user.logoutAt = null;
  user.active = true;
  await user.save();
  res.status(201).json({ data: user, token });
});

exports.logout = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (user && user.active === false) {
    return next(new ApiError("your not logged in", 401));
  }
  if (!user) {
    return next(new ApiError("user doesn't exist", 401));
  }
  let tempWorkingHours = parseInt(user.workingHours);
  // let tempWorkingHoursPerDay=parseInt(user.tempWorkingHoursPerDay)
  user.logoutAt = Date.now();
  await user.save();
  const workingHours =
    tempWorkingHours + user.logoutAt.getUTCHours() - user.loginAt.getUTCHours();
    // const workingHoursPerDay = 
    // tempWorkingHoursPerDay + tempWorkingHours

  user.active = false;
  user.workingHours = workingHours;
  // user.workingHoursPerDay=workingHoursPerDay
  user.logoutAt = Date.now();
  await user.save();

  res.status(201).json({ data: user });
});
//desc    make sure that user is logged in
exports.protect = asyncHandler(async (req, res, next) => {
  //1) check if token exists, if exsists get it
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(new ApiError("please login to get access to this route", 401));
  }

  //2)verify token (no change happens, expired token)
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  //3)check if user exists and not changed
  const currentUser = await User.findById(decoded.userId);
  if (!currentUser) {
    return next(
      new ApiError(
        "the user that belong to this token does no longer exist",
        401
      )
    );
  }

  //4) check if user change his password after token created
  if (currentUser.passwordChangedAt) {
    const passChangedTimestamp = parseInt(
      currentUser.passwordChangedAt.getTime() / 1000,
      10
    );
    if (passChangedTimestamp > decoded.iat) {
      return next(
        new ApiError("password is changed recently, please login again", 401)
      );
    }
  }

  req.user = currentUser;
  next();
});

//desc     Authorization (user permissiones)
exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError("You are not allowed to access this route", 403)
      );
    }
    next();
  });

exports.forgetPassword = asyncHandler(async (req, res, next) => {
  //1)  get user by email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    next(new ApiError("your not allowed to access this route", 401));
  }
  //2) if user exist, generate hashed reset random 6 digits and save it in db
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

  const secret = process.env.JWT_SECRET_KEY;
  const hashedResetCode = createHmac("sha256", secret)
    .update(resetCode)
    .digest("hex");

  user.passwordResetCode = hashedResetCode;
  //add expiration time for password reset (10m)
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  user.passwordResetVerfied = false;
  await user.save();

  //3) send the reset code via email
  const message = `Hi ${user.name}, \n we received a request to reset the password on your E-shop account \n ${resetCode}  \n Enter the code to complete the reset \n thanks for helping us keeping your account secure \n The E-Shop Team`;
  // try {
  await sendEmail({
    email: user.email,
    subject: "your password reset code (valide for 10 m)",
    message: message,
  });
  // } catch (err) {
  //   user.passwordResetCode = undefined;
  //   user.passwordResetExpires = undefined;
  //   user.passwordResetVerfied = undefined;
  //   await user.save();
  //   return next(new ApiError("there is an error in sending email", 500));
  // }
  res
    .status(200)
    .json({ status: "sucess", message: "reset code sent to email" });
});
