import express from "express";
import * as storyController from "../controllers/story";
import { tokenVerification } from "../middleware/auth";

const router = express.Router();

router.get("/:userId", tokenVerification, storyController.getByUserId);
router.post("/", tokenVerification, storyController.add);
router.delete("/:id", tokenVerification, storyController.deleteOne);

export default router;
