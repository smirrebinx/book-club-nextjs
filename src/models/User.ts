import mongoose, { Schema } from 'mongoose';

import type { Model } from 'mongoose';

export type UserRole = 'pending' | 'user' | 'admin';

export interface IUser {
  name?: string;
  email: string;
  emailVerified?: Date;
  image?: string;
  role: UserRole;
  isApproved: boolean;
  forcedLogoutAt?: Date;
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
    role: {
      type: String,
      enum: ['pending', 'user', 'admin'],
      default: 'pending',
      required: true
    },
    isApproved: {
      type: Boolean,
      default: false,
      required: true
    },
    forcedLogoutAt: { type: Date }
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
UserSchema.index({ role: 1 });
UserSchema.index({ isApproved: 1 });
UserSchema.index({ email: 1, role: 1 });

// Prevent model recompilation during hot reloads in development
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
