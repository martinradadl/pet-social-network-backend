import mongoose from "mongoose";

const schema = new mongoose.Schema({
  email: { type: String, unique: true },
  username: { type: String, unique: true },
  password: String,
  name: String,
  bio: String,
  profilePic: String,
  isPrivate: Boolean,
  isVerified: Boolean,
});

export const User = mongoose.model("User", schema);
