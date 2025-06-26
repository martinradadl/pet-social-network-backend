import { Request, Response } from "express";
import * as storyModel from "../models/story";

export const getByUserId = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;

    const stories = await storyModel.Story.find({ userId });
    res.status(200).json(stories);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};

export const add = async (req: Request, res: Response) => {
  try {
    const { userId, content, date } = req.body;
    const newStory = await storyModel.Story.create({ userId, content, date });
    res.status(200).json(newStory);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};

export const deleteOne = async (req: Request, res: Response) => {
  try {
    const deletedStory = await storyModel.Story.findByIdAndDelete(
      req.params.id
    );
    if (!deletedStory) {
      res.status(404).json({
        message: "Delete not successful",
        error: "Story not found",
      });
    }
    res.status(200).json(deletedStory);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};
