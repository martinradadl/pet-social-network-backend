import express from "express";
import * as likedCommentController from "../controllers/liked-comment";
import { tokenVerification } from "../middleware/auth";

const router = express.Router();

router.get(
  "/:commentId",
  tokenVerification,
  likedCommentController.getUsersByCommentId
);
router.post("/", tokenVerification, likedCommentController.add);
router.delete("/:id", tokenVerification, likedCommentController.deleteOne);

export default router;
