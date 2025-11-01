import mongoose, { Schema, Model } from 'mongoose';
import { BookInfo, MeetingData } from '@/types/meeting';

const BookInfoSchema = new Schema<BookInfo>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  coverImage: { type: String },
  isbn: { type: String },
}, { _id: false });

const MeetingSchema = new Schema<MeetingData>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    date: { type: String, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true },
    book: { type: BookInfoSchema, required: true },
    additionalInfo: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

// Prevent model recompilation during hot reloads in development
const Meeting: Model<MeetingData> =
  mongoose.models.Meeting || mongoose.model<MeetingData>('Meeting', MeetingSchema);

export default Meeting;
