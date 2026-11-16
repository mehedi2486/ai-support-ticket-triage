import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 100 },
  body: { type: String, required: true, maxlength: 1000 },
  summary: { type: String, required: true, maxlength: 500 },
  category: { type: String, required: true, enum: ["access", "performance", "bug", "other"] },
  priority: { type: String, required: true, enum: ["low", "medium", "high"] },
  model: { type: String, required: true },
}, { timestamps: true, versionKey: false });

export const Ticket = mongoose.model("Ticket", ticketSchema);

export async function connectDatabase(uri) {
  if (!uri) throw new Error("Set MONGODB_URI in your local .env file.");
  await mongoose.connect(uri, { dbName: "triage_lab", serverSelectionTimeoutMS: 8000, connectTimeoutMS: 8000, socketTimeoutMS: 8000 });
}
