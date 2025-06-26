import mongoose from "mongoose";

const schema = new mongoose.Schema({
  membersId: [{ type: mongoose.Types.ObjectId, ref: "User" }],
  title: String,
});

export const Chat = mongoose.model("Chat", schema);
