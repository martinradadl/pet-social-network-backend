import { Request, Response } from "express";
import * as likedPostModel from "../models/liked-post";

export const getUsersByPostId = async (req: Request, res: Response) => {
  try {
    const postId = req.params.postId;

    const likes = await likedPostModel.LikedPost.find({ postId });
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
    const newLikedPost = await likedPostModel.LikedPost.create({
      userId: req.body.userId,
      postId: req.body.postId,
    });
    return res.status(200).json(newLikedPost);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
  }
};

export const deleteOne = async (req: Request, res: Response) => {
  try {
    const deletedLikedPost = await likedPostModel.LikedPost.findByIdAndDelete(
      req.params.id
    );
    if (!deletedLikedPost) {
      return res.status(404).json({
        message: "Delete not successful",
        error: "Liked Post not found",
      });
    }
    return res.status(200).json(deletedLikedPost);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
  }
};
