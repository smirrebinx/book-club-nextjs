import mongoose, { Schema } from 'mongoose';

import type { Model , Types } from 'mongoose';

export type SuggestionStatus = 'pending' | 'approved' | 'currently_reading' | 'rejected';

export interface IBookSuggestion {
  title: string;
  author: string;
  description: string;
  suggestedBy: Types.ObjectId;
  votes: Types.ObjectId[];
  status: SuggestionStatus;
  isbn?: string;
  coverImage?: string;
  googleBooksId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const BookSuggestionSchema = new Schema<IBookSuggestion>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    author: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    description: {
      type: String,
      required: false,
      trim: true,
      maxlength: 1000,
      default: ''
    },
    suggestedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    votes: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    status: {
      type: String,
      enum: ['pending', 'approved', 'currently_reading', 'rejected'],
      default: 'pending',
      required: true
    },
    isbn: {
      type: String,
      required: false,
      trim: true
    },
    coverImage: {
      type: String,
      required: false,
      trim: true
    },
    googleBooksId: {
      type: String,
      required: false,
      trim: true
    }
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
BookSuggestionSchema.index({ status: 1 });
BookSuggestionSchema.index({ votes: 1 });
BookSuggestionSchema.index({ suggestedBy: 1 });
BookSuggestionSchema.index({ createdAt: -1 });

// Prevent model recompilation during hot reloads in development
const BookSuggestion: Model<IBookSuggestion> =
  mongoose.models.BookSuggestion || mongoose.model<IBookSuggestion>('BookSuggestion', BookSuggestionSchema);

export default BookSuggestion;
