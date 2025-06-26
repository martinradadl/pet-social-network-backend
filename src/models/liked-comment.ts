import mongoose from "mongoose";

const schema = new mongoose.Schema({
  commentId: { type: mongoose.Types.ObjectId, ref: "Comment" },
  userId: { type: mongoose.Types.ObjectId, ref: "User" },
});

export const LikedComment = mongoose.model("LikedComment", schema);
