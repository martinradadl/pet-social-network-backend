import mongoose from "mongoose";

const schema = new mongoose.Schema({
  userId: { type: mongoose.Types.ObjectId, ref: "User" },
  content: [String],
  description: String,
  date: Date,
});

export const Post = mongoose.model("Post", schema);
