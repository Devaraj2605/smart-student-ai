import mongoose from "mongoose";

export async function connectDB(mongoUri) {
  if (!mongoUri) {
    throw new Error("MONGO_URI is not set");
  }

  try {
    mongoose.set("strictQuery", true);

    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error("MongoDB connection error:", err?.message ?? err);
    throw err;
  }
}
