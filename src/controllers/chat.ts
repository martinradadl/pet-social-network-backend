import { Request, Response } from "express";
import * as chatModel from "../models/chat";

export const getByUserId = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query?.page as string) || 1;
    const limit = parseInt(req.query?.limit as string) || 0;

    const findQuery: { [key: string]: object | string } = {
      membersId: req.params.userId,
    };
    const messages = await chatModel.Chat.find(findQuery)
      .limit(limit)
      .skip((page - 1) * limit);

    res.status(200).json(messages);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};

export const add = async (req: Request, res: Response) => {
  try {
    const { membersId, title } = req.body;
    const newChat = await chatModel.Chat.create({
      membersId,
      title,
    });
    res.status(200).json(newChat);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};

export const edit = async (req: Request, res: Response) => {
  try {
    const { title } = req.body;
    const editedChat = await chatModel.Chat.findByIdAndUpdate(req.params.id, {
      title,
    });
    if (!editedChat) {
      res.status(404).json({
        message: "Edit not successful",
        error: "Chat not found",
      });
    }
    res.status(200).json(editedChat);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};

export const deleteOne = async (req: Request, res: Response) => {
  try {
    const deletedChat = await chatModel.Chat.findByIdAndDelete(req.params.id);
    if (!deletedChat) {
      res.status(404).json({
        message: "Delete not successful",
        error: "Chat not found",
      });
    }
    res.status(200).json(deletedChat);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};
