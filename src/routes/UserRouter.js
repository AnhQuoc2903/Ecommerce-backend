const express = require("express");
const router = express.Router();
const userController = require("../controllers/UserController");
const {
  authMiddleWare,
  authUserMiddleWare,
} = require("../middleware/authMiddleware");

router.post("/sign-up", userController.createUser);
router.post("/sign-in", userController.loginUser);
router.post("/log-out", userController.logoutUser);
router.put("/update-user/:id", authUserMiddleWare, userController.updateUser);
router.delete("/delete-user/:id", authMiddleWare, userController.deleteUser);
router.get(
  "/getAll",
  authMiddleWare,
  authUserMiddleWare,
  userController.getAllUser
);
router.get(
  "/get-details/:id",
  authUserMiddleWare,
  userController.getDetailsUser
);
router.post("/delete-many", authMiddleWare, userController.deleteManyUser);
router.post("/refresh-token", userController.refreshToken);
router.post("/google-auth", userController.googleAuth);
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password/:token", userController.resetPassword);
router.put(
  "/change-password/:id",
  authUserMiddleWare,
  userController.changePassword
);
router.put("/block-user/:id", authMiddleWare, userController.blockUser);

module.exports = router;
