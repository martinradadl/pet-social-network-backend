import express from "express";
import * as storyController from "../controllers/story";
import { tokenVerification } from "../middleware/auth";

const router = express.Router();

router.get("/:userId", tokenVerification, storyController.getByUserId);
router.post("/:userId", tokenVerification, storyController.add);
router.delete("/:userId", tokenVerification, storyController.deleteOne);

export default router;
