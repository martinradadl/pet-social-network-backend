import express from "express";
import * as savedPostController from "../controllers/saved-post";
import { tokenVerification } from "../middleware/auth";

const router = express.Router();

router.get("/:userId", tokenVerification, savedPostController.getPostsByUserId);
router.post("/", tokenVerification, savedPostController.add);
router.delete("/:id", tokenVerification, savedPostController.deleteOne);

export default router;
