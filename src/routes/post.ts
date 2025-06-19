import express from "express";
import * as postController from "../controllers/post";
import { tokenVerification } from "../middleware/auth";

const router = express.Router();

router.get("/:userId", tokenVerification, postController.get);
router.post("/", tokenVerification, postController.add);
router.put("/:id", tokenVerification, postController.edit);
router.delete("/:id", tokenVerification, postController.deleteOne);

export default router;
