import { Request, Response } from "express";
import * as storyModel from "../models/story";

export const getByUserId = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;

    const stories = await storyModel.Story.find({ userId });
    return res.status(200).json(stories);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
  }
};

export const add = async (req: Request, res: Response) => {
  try {
    const newStory = await storyModel.Story.create({
      userId: req.body.userId,
      content: req.body.content,
      date: req.body.date,
    });
    return res.status(200).json(newStory);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
  }
};

export const deleteOne = async (req: Request, res: Response) => {
  try {
    const deletedStory = await storyModel.Story.findByIdAndDelete(
      req.params.id
    );
    if (!deletedStory) {
      return res.status(404).json({
        message: "Delete not successful",
        error: "Story not found",
      });
    }
    return res.status(200).json(deletedStory);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
  }
};
