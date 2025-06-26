import { Request, Response } from "express";
import * as DirectMessageModel from "../models/direct-message";

export const get = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query?.page as string) || 1;
    const limit = parseInt(req.query?.limit as string) || 0;

    const findQuery: { [key: string]: object | string } = {
      chatId: req.params.chatId,
    };

    const messages = await DirectMessageModel.DirectMessage.find(findQuery)
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
    const { senderId, chatId, message, date } = req.body;
    const newMessage = await DirectMessageModel.DirectMessage.create({
      senderId,
      chatId,
      message,
      date,
    });
    res.status(200).json(newMessage);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};

export const edit = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    const editedMessage =
      await DirectMessageModel.DirectMessage.findByIdAndUpdate(req.params.id, {
        message,
      });
    if (!editedMessage) {
      res.status(404).json({
        message: "Delete not successful",
        error: "Message not found",
      });
    }
    res.status(200).json(editedMessage);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};

export const deleteOne = async (req: Request, res: Response) => {
  try {
    const deletedMessage =
      await DirectMessageModel.DirectMessage.findByIdAndDelete(req.params.id);
    if (!deletedMessage) {
      res.status(404).json({
        message: "Delete not successful",
        error: "Message not found",
      });
    }
    res.status(200).json(deletedMessage);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};
