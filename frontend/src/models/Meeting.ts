import mongoose, { Schema } from 'mongoose';

import type { BookInfo, MeetingData } from '@/types/meeting';
import type { Model } from 'mongoose';

const BookInfoSchema = new Schema<BookInfo>({
  id: { type: String, required: false },
  title: { type: String, required: false },
  author: { type: String, required: false },
  coverImage: { type: String },
  isbn: { type: String },
  googleDescription: { type: String },
}, { _id: false });

const MeetingSchema = new Schema<MeetingData>(
  {
    id: {
      type: String,
      required: false,
      index: true
    },
    date: { type: String, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true },
    book: { type: BookInfoSchema, required: false },
    additionalInfo: { type: String, required: false },
  },
  {
    timestamps: true,
  }
);

// Prevent model recompilation during hot reloads in development
const Meeting: Model<MeetingData> =
  mongoose.models.Meeting || mongoose.model<MeetingData>('Meeting', MeetingSchema);

export default Meeting;
