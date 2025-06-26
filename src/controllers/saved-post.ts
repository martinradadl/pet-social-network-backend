import { Request, Response } from "express";
import * as savedPostModel from "../models/saved-post";

export const getPostsByUserId = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;

    const saves = await savedPostModel.SavedPost.find({ userId });
    const posts = saves.map((save) => save.postId);
    res.status(200).json(posts);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};

export const add = async (req: Request, res: Response) => {
  try {
    const { userId, postId } = req.body;
    const newSavedPost = await savedPostModel.SavedPost.create({
      userId,
      postId,
    });
    res.status(200).json(newSavedPost);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};

export const deleteOne = async (req: Request, res: Response) => {
  try {
    const deletedSavedPost = await savedPostModel.SavedPost.findByIdAndDelete(
      req.params.id
    );
    if (!deletedSavedPost) {
      res.status(404).json({
        message: "Delete not successful",
        error: "savedPost not found",
      });
    }
    res.status(200).json(deletedSavedPost);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};
