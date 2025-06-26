import express from "express";
import * as authController from "../controllers/auth";
import { tokenVerification } from "../middleware/auth";
import { upload } from "../middleware/file-upload";

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.put(
  "/change-password/:id",
  tokenVerification,
  authController.changePassword
);
router.put(
  "/:id",
  tokenVerification,
  upload.single("avatar"),
  authController.edit
);
router.delete("/:id", tokenVerification, authController.deleteUser);
router.get(
  "/:id/check-password",
  tokenVerification,
  authController.checkPassword
);
router.get("/forgot-password/:email", authController.forgotPassword);
router.put(
  "/reset-password/:id",
  tokenVerification,
  authController.resetPassword
);

export default router;
