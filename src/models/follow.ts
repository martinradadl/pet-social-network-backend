import mongoose from "mongoose";

const schema = new mongoose.Schema({
  followerId: { type: mongoose.Types.ObjectId, ref: "User" },
  followedId: { type: mongoose.Types.ObjectId, ref: "User" },
});

export const Follow = mongoose.model("Follow", schema);
