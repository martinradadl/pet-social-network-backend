import mongoose from "mongoose";

const schema = new mongoose.Schema({
  senderId: { type: mongoose.Types.ObjectId, ref: "User" },
  chatId: { type: mongoose.Types.ObjectId, ref: "Chat" },
  message: String,
  date: Date,
});

export const DirectMessage = mongoose.model("DirectMessage", schema);
