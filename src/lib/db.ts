import mongoose from "mongoose";

let cached = (global as { mongoose?: { conn: unknown; promise: Promise<unknown> | null } }).mongoose;

if (!cached) {
  cached = (global as { mongoose?: { conn: unknown; promise: Promise<unknown> | null } }).mongoose = {
    conn: null,
    promise: null,
  };
}

export default async function connectToDatabase() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined");
  }

  if (cached!.conn) return cached!.conn;

  if (!cached!.promise) {
    cached!.promise = mongoose.connect(process.env.MONGODB_URI, { bufferCommands: false });
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    cached!.promise = null;
    throw e;
  }

  return cached!.conn;
}
