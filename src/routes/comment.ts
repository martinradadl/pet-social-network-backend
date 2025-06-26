import express from "express";
import * as commentController from "../controllers/comment";
import { tokenVerification } from "../middleware/auth";

const router = express.Router();

router.get("/:postId", tokenVerification, commentController.getByPostId);
router.post("/", tokenVerification, commentController.add);
router.put("/:id", tokenVerification, commentController.edit);
router.delete("/:id", tokenVerification, commentController.deleteOne);

export default router;
