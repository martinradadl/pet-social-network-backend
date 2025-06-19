import { Request, Response } from "express";
import * as followModel from "../models/follow";

export const getFollowers = async (req: Request, res: Response) => {
  try {
    const followedId = req.params.userId;

    const follows = await followModel.Follow.find({ followedId });
    const followers = follows.map((follow) => follow.followerId);
    res.status(200).json(followers);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};

export const getFollowing = async (req: Request, res: Response) => {
  try {
    const followerId = req.params.userId;

    const follows = await followModel.Follow.find({ followerId });
    const followings = follows.map((follow) => follow.followedId);
    res.status(200).json(followings);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};

export const add = async (req: Request, res: Response) => {
  try {
    const { followerId, followedId } = req.body;
    const newFollow = await followModel.Follow.create({
      followerId,
      followedId,
    });
    res.status(200).json(newFollow);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};

export const deleteOne = async (req: Request, res: Response) => {
  try {
    const deletedFollow = await followModel.Follow.findByIdAndDelete(
      req.params.id
    );
    if (!deletedFollow) {
      res.status(404).json({
        message: "Delete not successful",
        error: "Follow not found",
      });
    }
    res.status(200).json(deletedFollow);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};
