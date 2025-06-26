import express from "express";
import * as sharedPostController from "../controllers/shared-post";
import { tokenVerification } from "../middleware/auth";

const router = express.Router();

router.get(
  "/:userId/posts",
  tokenVerification,
  sharedPostController.getPostsByUserId
);
router.get(
  "/:postId/users",
  tokenVerification,
  sharedPostController.getUsersByPostId
);
router.post("/", tokenVerification, sharedPostController.add);
router.delete("/:id", tokenVerification, sharedPostController.deleteOne);

export default router;
