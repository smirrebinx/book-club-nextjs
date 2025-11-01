import mongoose, { Schema } from 'mongoose';

import type { Model } from 'mongoose';

export interface IUser {
  name?: string;
  email: string;
  emailVerified?: Date;
  image?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    emailVerified: { type: Date },
    image: { type: String },
  },
  {
    timestamps: true,
  }
);

// Prevent model recompilation during hot reloads in development
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
