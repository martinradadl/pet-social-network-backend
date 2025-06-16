import { Request, Response } from "express";
import * as sharedPostModel from "../models/shared-post";

export const getUsersByPostId = async (req: Request, res: Response) => {
  try {
    const postId = req.params.postId;

    const shares = await sharedPostModel.SharedPost.find({ postId });
    const users = shares.map((share) => share.userId);
    return res.status(200).json(users);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
  }
};

export const getPostsByUserId = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;

    const shares = await sharedPostModel.SharedPost.find({ userId });
    const posts = shares.map((share) => share.postId);
    return res.status(200).json(posts);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
  }
};

export const add = async (req: Request, res: Response) => {
  try {
    const newSharedPost = await sharedPostModel.SharedPost.create({
      userId: req.body.userId,
      postId: req.body.postId,
    });
    return res.status(200).json(newSharedPost);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
  }
};

export const deleteOne = async (req: Request, res: Response) => {
  try {
    const deletedSharedPost =
      await sharedPostModel.SharedPost.findByIdAndDelete(req.params.id);
    if (!deletedSharedPost) {
      return res.status(404).json({
        message: "Delete not successful",
        error: "SharedPost not found",
      });
    }
    return res.status(200).json(deletedSharedPost);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
  }
};
