import mongoose, { Schema } from 'mongoose';

import type { Model , Types } from 'mongoose';

export type SuggestionStatus = 'pending' | 'approved' | 'currently_reading' | 'rejected' | 'read';

export interface IBookSuggestion {
  title: string;
  author: string;
  description: string;
  googleDescription?: string;
  suggestedBy: Types.ObjectId;
  votes: Types.ObjectId[];
  status: SuggestionStatus;
  isbn?: string;
  coverImage?: string;
  googleBooksId?: string;
  // New fields for 3-winner voting system
  votingRound?: Types.ObjectId; // Reference to VotingRound when this book won
  placement?: 1 | 2 | 3; // Winner placement (1st, 2nd, or 3rd) - TODO-SCALABILITY: Hardcoded to 3
  wonAt?: Date; // When this book won
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
    googleDescription: {
      type: String,
      required: false,
      trim: true,
      maxlength: 2000
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
      enum: ['pending', 'approved', 'currently_reading', 'rejected', 'read'],
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
    },
    // New fields for 3-winner voting system (additive, backward compatible)
    votingRound: {
      type: Schema.Types.ObjectId,
      ref: 'VotingRound',
      required: false
    },
    placement: {
      type: Number,
      enum: [1, 2, 3], // TODO-SCALABILITY: Hardcoded to 3 winners
      required: false
    },
    wonAt: {
      type: Date,
      required: false
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
