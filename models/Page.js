// models/Page.js
import mongoose from "mongoose";

const BlockSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["text", "link", "post"], required: true },
    text: { type: String, default: "" },  // text content or link label
    url: { type: String, default: "" },   // for link blocks
    style: {
      type: String,
      enum: ["body", "heading", "subheading"],
      default: "body",
    }, // only really used for text blocks
    description: { type: String, default: "" },
    content: { type: String, default: "" }, 
  },
  { _id: false }
);

const PageSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    title: { type: String, default: "" },
    blocks: { type: [BlockSchema], default: [] },
    published: { type: Boolean, default: false },

    communityListed: { type: Boolean, default: false },
    
  },
  { timestamps: true }
);

export const Page =
  mongoose.models.Page || mongoose.model("Page", PageSchema);
