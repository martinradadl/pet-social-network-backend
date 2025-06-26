import mongoose from "mongoose";

const schema = new mongoose.Schema({
  userId: { type: mongoose.Types.ObjectId, ref: "User" },
  content: String,
  date: Date,
});

export const Story = mongoose.model("Story", schema);
