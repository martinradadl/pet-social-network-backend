import express from "express";
import * as likedPostController from "../controllers/liked-post";
import { tokenVerification } from "../middleware/auth";

const router = express.Router();

router.get("/:postId", tokenVerification, likedPostController.getUsersByPostId);
router.post("/", tokenVerification, likedPostController.add);
router.delete("/:id", tokenVerification, likedPostController.deleteOne);

export default router;
