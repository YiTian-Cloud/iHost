// models/Profile.ts
import mongoose, { Schema, Model, Document } from "mongoose";

export interface IProfile extends Document {
  userId: mongoose.Types.ObjectId;
  username: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  theme: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProfileSchema = new Schema<IProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    displayName: { type: String, required: true },
    bio: { type: String },
    avatarUrl: { type: String },
    theme: { type: String, default: "light" },
  },
  { timestamps: true }
);

export const Profile: Model<IProfile> =
  mongoose.models.Profile || mongoose.model<IProfile>("Profile", ProfileSchema);
