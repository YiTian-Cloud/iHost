import mongoose from "mongoose";

const LinkSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    label: { type: String, required: true },
    url: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Link =
  mongoose.models.Link || mongoose.model("Link", LinkSchema);
