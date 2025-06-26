import { Request, Response } from "express";
import * as postModel from "../models/post";

export const get = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query?.page as string) || 1;
    const limit = parseInt(req.query?.limit as string) || 0;

    const findQuery: { [key: string]: object | string } = {
      userId: req.params.userId,
    };

    const posts = await postModel.Post.find(findQuery)
      .limit(limit)
      .skip((page - 1) * limit);

    res.status(200).json(posts);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};

export const add = async (req: Request, res: Response) => {
  try {
    const { userId, content, description, date } = req.body;
    const newPost = await postModel.Post.create({
      userId,
      content,
      description,
      date,
    });
    res.status(200).json(newPost);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};

export const edit = async (req: Request, res: Response) => {
  try {
    const { description } = req.body;
    const editedPost = await postModel.Post.findByIdAndUpdate(req.params.id, {
      description,
    });
    if (!editedPost) {
      res.status(404).json({
        message: "Edit not successful",
        error: "Post not found",
      });
    }
    res.status(200).json(editedPost);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};

export const deleteOne = async (req: Request, res: Response) => {
  try {
    const deletedPost = await postModel.Post.findByIdAndDelete(req.params.id);
    if (!deletedPost) {
      res.status(404).json({
        message: "Delete not successful",
        error: "Post not found",
      });
    }
    res.status(200).json(deletedPost);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};
