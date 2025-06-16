import mongoose from "mongoose";

const schema = new mongoose.Schema({
  senderId: { type: mongoose.Types.ObjectId, ref: "User" },
  receiverId: { type: mongoose.Types.ObjectId, ref: "User" },
  message: String,
  date: Date,
});

export const Comment = mongoose.model("Comment", schema);
