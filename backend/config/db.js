import mongoose from "mongoose";

const options = {};

export async function connectDb() {
  return await mongoose.connect(process.env.MONGODB_URI);
}
