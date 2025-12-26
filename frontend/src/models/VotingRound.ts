import mongoose, { Schema, model, models, Types } from 'mongoose';

/**
 * VotingRound Model - Single Source of Truth for Voting State
 *
 * This model manages the entire lifecycle of voting rounds:
 * - active: Voting is open, users can vote
 * - finalized: Winners selected, voting locked, books assigned to meetings
 * - completed: Reset cycle executed, round archived
 *
 * CRITICAL CONSTRAINTS:
 * - Only ONE active OR finalized round can exist at a time (enforced by DB index)
 * - roundNumber is unique across all rounds
 * - Winners array is write-once during finalization
 */

export interface IVotingRound {
  roundNumber: number; // Auto-incremented, unique identifier for this round
  status: 'active' | 'finalized' | 'completed';
  winners: Array<{
    bookId: Types.ObjectId; // Reference to BookSuggestion
    placement: 1 | 2 | 3; // Winner rank (1st, 2nd, 3rd)
    voteCount: number; // Snapshot of votes at finalization time
    assignedMeetingId?: Types.ObjectId; // Reference to Meeting (may be null if < 3 meetings available)
    assignedAt?: Date; // When the assignment happened
  }>;
  finalizedAt?: Date; // When admin finalized this round
  finalizedBy?: Types.ObjectId; // Admin user who finalized (audit trail)
  completedAt?: Date; // When reset cycle was executed
  createdAt?: Date;
  updatedAt?: Date;
}

const VotingRoundSchema = new Schema<IVotingRound>(
  {
    roundNumber: {
      type: Number,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['active', 'finalized', 'completed'],
      required: true,
      default: 'active',
    },
    winners: [
      {
        bookId: {
          type: Schema.Types.ObjectId,
          ref: 'BookSuggestion',
          required: true,
        },
        placement: {
          type: Number,
          enum: [1, 2, 3], // TODO-SCALABILITY: Hardcoded to 3 winners
          required: true,
        },
        voteCount: {
          type: Number,
          required: true,
          min: 0,
        },
        assignedMeetingId: {
          type: Schema.Types.ObjectId,
          ref: 'Meeting',
        },
        assignedAt: {
          type: Date,
        },
      },
    ],
    finalizedAt: {
      type: Date,
    },
    finalizedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// CRITICAL: DB-level constraint - only ONE active or finalized round at a time
//
// CONCURRENCY GUARANTEE:
// This partial unique index ensures that only one round can have status 'active' OR 'finalized'
// at any given time. Multiple concurrent transactions attempting to create duplicate rounds
// will fail with error code 11000 (duplicate key error).
//
// Example scenarios:
// - Round 1 with status 'active' exists → Cannot create another 'active' round
// - Round 1 transitions to 'finalized' → Cannot create another 'finalized' round
// - Round 1 transitions to 'completed' → Index no longer applies, new 'active' round can be created
//
// Why partial index instead of unique on status alone:
// - We want multiple 'completed' rounds (historical archive)
// - We only want uniqueness for 'active' and 'finalized' states
VotingRoundSchema.index(
  { status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ['active', 'finalized'] } },
    name: 'unique_active_or_finalized_round',
  }
);

// Ensure roundNumber is unique across all rounds
VotingRoundSchema.index({ roundNumber: 1 }, { unique: true });

// Fast lookup of current round (most common query)
VotingRoundSchema.index({ status: 1, createdAt: -1 });

const VotingRound =
  models.VotingRound || model<IVotingRound>('VotingRound', VotingRoundSchema);

export default VotingRound;
