import { Request, Response } from "express";
import * as followModel from "../models/follow";

export const getFollowers = async (req: Request, res: Response) => {
  try {
    const followedId = req.params.userId;

    const follows = await followModel.Follow.find({ followedId });
    const followers = follows.map((follow) => follow.followerId);
    return res.status(200).json(followers);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
  }
};

export const add = async (req: Request, res: Response) => {
  try {
    const newFollow = await followModel.Follow.create({
      followerId: req.body.followerId,
      followedId: req.body.followedId,
    });
    return res.status(200).json(newFollow);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
  }
};

export const deleteOne = async (req: Request, res: Response) => {
  try {
    const deletedFollow = await followModel.Follow.findByIdAndDelete(
      req.params.id
    );
    if (!deletedFollow) {
      return res.status(404).json({
        message: "Delete not successful",
        error: "Follow not found",
      });
    }
    return res.status(200).json(deletedFollow);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
  }
};
