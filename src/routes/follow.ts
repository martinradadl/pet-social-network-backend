import express from "express";
import * as followController from "../controllers/follow";
import { tokenVerification } from "../middleware/auth";

const router = express.Router();

router.get(
  "/:userId/followers",
  tokenVerification,
  followController.getFollowers
);
router.get(
  "/:userId/following",
  tokenVerification,
  followController.getFollowing
);
router.post("/", tokenVerification, followController.add);
router.delete("/:id", tokenVerification, followController.deleteOne);

export default router;
