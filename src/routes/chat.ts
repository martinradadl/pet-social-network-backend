import express from "express";
import * as chatController from "../controllers/chat";
import { tokenVerification } from "../middleware/auth";

const router = express.Router();

router.get("/:userId", tokenVerification, chatController.getByUserId);
router.post("/", tokenVerification, chatController.add);
router.put("/:id", tokenVerification, chatController.edit);
router.delete("/:id", tokenVerification, chatController.deleteOne);

export default router;
