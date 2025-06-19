import express from "express";
import * as directMessageController from "../controllers/direct-message";
import { tokenVerification } from "../middleware/auth";

const router = express.Router();

router.get("/:chatId", tokenVerification, directMessageController.get);
router.post("/", tokenVerification, directMessageController.add);
router.put("/:id", tokenVerification, directMessageController.edit);
router.delete("/:id", tokenVerification, directMessageController.deleteOne);

export default router;
