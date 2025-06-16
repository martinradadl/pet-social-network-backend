import mongoose from "mongoose";

const uri = "";

export async function initMongo() {
  try {
    await mongoose.connect(uri);
  } finally {
    console.log("mongosetup complete");
  }
}

export const ObjectId = mongoose.Types.ObjectId;

export type ObjectIdI = mongoose.ObjectId;
