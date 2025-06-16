import mongoose from "mongoose";

const schema = new mongoose.Schema({
  postId: { type: mongoose.Types.ObjectId, ref: "Post" },
  userId: { type: mongoose.Types.ObjectId, ref: "User" },
});

export const SharedPost = mongoose.model("SharedPost", schema);
