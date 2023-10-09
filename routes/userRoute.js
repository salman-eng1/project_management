const express = require("express");

const router = express.Router();

const {
  getUserValidator,
  updateUserValidator,
  deleteUserValidator,
  createUserValidator,
  changeUserPasswordValidator,
} = require("../utils/validators/userValidator");
const {
  getUsers,
  createUser,
  getUser,
  uploadUserImage,
  resizeImage,
  updateUser,
  deleteUser,
  changeUserPassword,
} = require("../services/userService");

const authService = require("../services/authService");

router
  .route("/")
  .get(
    authService.protect,
    authService.allowedTo("admin"),
    getUsers
  )
  .post(
    authService.protect,
    authService.allowedTo("admin"),
    uploadUserImage,
    resizeImage,
    createUserValidator,
    createUser
  );
router
  .route("/:id")
  .get(getUserValidator, getUser)
  .put(
    authService.protect,
    authService.allowedTo("admin"),
    uploadUserImage,
    resizeImage,
    updateUserValidator,
    updateUser
  )
  .delete(
    authService.protect,
    authService.allowedTo("admin"),
    deleteUserValidator,
    deleteUser
  );

router.put(
  "/changepassword/:id",
  changeUserPasswordValidator,
  changeUserPassword
);

module.exports = router;
