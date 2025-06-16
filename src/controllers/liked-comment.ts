import { Request, Response } from "express";
import * as likedCommentModel from "../models/liked-comment";

export const getUsersByCommentId = async (req: Request, res: Response) => {
  try {
    const commentId = req.params.commentId;

    const likes = await likedCommentModel.LikedComment.find({ commentId });
    const users = likes.map((like) => like.userId);
    return res.status(200).json(users);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
  }
};

export const add = async (req: Request, res: Response) => {
  try {
    const newLikedComment = await likedCommentModel.LikedComment.create({
      userId: req.body.userId,
      commentId: req.body.commentId,
    });
    return res.status(200).json(newLikedComment);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
  }
};

export const deleteOne = async (req: Request, res: Response) => {
  try {
    const deletedLikedComment =
      await likedCommentModel.LikedComment.findByIdAndDelete(req.params.id);
    if (!deletedLikedComment) {
      return res.status(404).json({
        message: "Delete not successful",
        error: "Liked Comment not found",
      });
    }
    return res.status(200).json(deletedLikedComment);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
  }
};
