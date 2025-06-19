import mongoose from "mongoose";

const schema = new mongoose.Schema({
  postId: { type: mongoose.Types.ObjectId, ref: "Post" },
  userId: { type: mongoose.Types.ObjectId, ref: "User" },
  content: String,
  repliedTo: { type: mongoose.Types.ObjectId, ref: "Comment" },
  date: Date,
});

export const Comment = mongoose.model("Comment", schema);
