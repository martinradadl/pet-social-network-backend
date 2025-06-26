import { Request, Response } from "express";
import * as CommentModel from "../models/comment";

export const getByPostId = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query?.page as string) || 1;
    const limit = parseInt(req.query?.limit as string) || 0;

    const findQuery: { [key: string]: object | string } = {
      postId: req.params.postId,
    };

    const posts = await CommentModel.Comment.find(findQuery)
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
    const { postId, userId, content, repliedTo, date } = req.body;
    const newComment = await CommentModel.Comment.create({
      postId,
      userId,
      content,
      repliedTo,
      date,
    });
    res.status(200).json(newComment);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};

export const edit = async (req: Request, res: Response) => {
  try {
    const { content } = req.body;
    const editedComment = await CommentModel.Comment.findByIdAndUpdate(
      req.params.id,
      { content }
    );
    if (!editedComment) {
      res.status(404).json({
        message: "Delete not successful",
        error: "Comment not found",
      });
    }
    res.status(200).json(editedComment);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};

export const deleteOne = async (req: Request, res: Response) => {
  try {
    const deletedComment = await CommentModel.Comment.findByIdAndDelete(
      req.params.id
    );
    if (!deletedComment) {
      res.status(404).json({
        message: "Delete not successful",
        error: "Comment not found",
      });
    }
    res.status(200).json(deletedComment);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};
