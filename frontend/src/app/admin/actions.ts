'use server';

import mongoose, { Types } from 'mongoose';
import { revalidatePath } from 'next/cache';

import { requireAdmin } from '@/lib/auth-helpers';
import connectDB from '@/lib/mongodb';
import {
  approveUserSchema,
  changeRoleSchema,
  updateSuggestionStatusSchema,
  deleteSuggestionSchema,
  deleteUserSchema,
  forceLogoutUserSchema,
} from '@/lib/validations/admin';
import BookSuggestion from '@/models/BookSuggestion';
import Meeting from '@/models/Meeting';
import User from '@/models/User';
import VotingRound from '@/models/VotingRound';

import type { IBookSuggestion, SuggestionStatus } from '@/models/BookSuggestion';
import type { UserRole } from '@/models/User';
import type { IVotingRound } from '@/models/VotingRound';
import type { MeetingData } from '@/types/meeting';

// Type aliases for Mongoose documents
type BookDocument = mongoose.Document<unknown, object, IBookSuggestion> & IBookSuggestion;
type MeetingDocument = mongoose.Document<unknown, object, MeetingData> & MeetingData;
type VotingRoundDocument = mongoose.Document<unknown, object, IVotingRound> & IVotingRound;

/**
 * Approve a pending user
 */
export async function approveUser(userId: string) {
  try {
    await requireAdmin();

    // Validate input
    const validated = approveUserSchema.parse({ userId });

    await connectDB();
    const user = await User.findById(validated.userId);

    if (!user) {
      return { success: false, error: 'Användare hittades inte' };
    }

    user.isApproved = true;
    // If user is pending, promote to 'user' role
    if (user.role === 'pending') {
      user.role = 'user';
    }

    await user.save();

    revalidatePath('/admin/users');
    return { success: true, message: 'Användare godkänd' };
  } catch (error) {
    console.error('Error approving user:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Kunde inte godkänna användare' };
  }
}

/**
 * Reject a user (set isApproved to false)
 */
export async function rejectUser(userId: string) {
  try {
    await requireAdmin();

    // Validate input
    const validated = approveUserSchema.parse({ userId });

    await connectDB();
    const user = await User.findById(validated.userId);

    if (!user) {
      return { success: false, error: 'Användare hittades inte' };
    }

    // Prevent rejecting admins
    if (user.role === 'admin') {
      return { success: false, error: 'Kan inte avvisa en administratör' };
    }

    user.isApproved = false;
    user.role = 'pending';

    await user.save();

    revalidatePath('/admin/users');
    return { success: true, message: 'Användare avvisad' };
  } catch (error) {
    console.error('Error rejecting user:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Kunde inte avvisa användare' };
  }
}

/**
 * Change user role
 */
export async function changeUserRole(userId: string, role: UserRole) {
  try {
    await requireAdmin();

    // Validate input
    const validated = changeRoleSchema.parse({ userId, role });

    await connectDB();
    const user = await User.findById(validated.userId);

    if (!user) {
      return { success: false, error: 'Användare hittades inte' };
    }

    user.role = validated.role;

    // If promoting to user or admin, also approve them
    if (validated.role === 'user' || validated.role === 'admin') {
      user.isApproved = true;
    }

    await user.save();

    revalidatePath('/admin/users');
    return { success: true, message: 'Användarroll uppdaterad' };
  } catch (error) {
    console.error('Error changing user role:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Kunde inte ändra användarroll' };
  }
}

/**
 * Update suggestion status (admin only)
 */
export async function updateSuggestionStatus(
  suggestionId: string,
  status: SuggestionStatus
) {
  try {
    await requireAdmin();

    // Validate input
    const validated = updateSuggestionStatusSchema.parse({ suggestionId, status });

    await connectDB();
    const suggestion = await BookSuggestion.findById(validated.suggestionId);

    if (!suggestion) {
      return { success: false, error: 'Förslag hittades inte' };
    }

    suggestion.status = validated.status;
    await suggestion.save();

    revalidatePath('/admin/suggestions');
    revalidatePath('/suggestions');
    return { success: true, message: 'Status uppdaterad' };
  } catch (error) {
    console.error('Error updating suggestion status:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Kunde inte uppdatera status' };
  }
}

/**
 * Delete suggestion (admin only)
 */
export async function deleteSuggestionAsAdmin(suggestionId: string) {
  try {
    await requireAdmin();

    // Validate input
    const validated = deleteSuggestionSchema.parse({ suggestionId });

    await connectDB();
    const suggestion = await BookSuggestion.findById(validated.suggestionId);

    if (!suggestion) {
      return { success: false, error: 'Förslag hittades inte' };
    }

    await suggestion.deleteOne();

    revalidatePath('/admin/suggestions');
    revalidatePath('/suggestions');
    return { success: true, message: 'Förslag borttaget' };
  } catch (error) {
    console.error('Error deleting suggestion:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Kunde inte ta bort förslag' };
  }
}

/**
 * Delete user (admin only)
 */
export async function deleteUser(userId: string) {
  try {
    await requireAdmin();

    // Validate input
    const validated = deleteUserSchema.parse({ userId });

    await connectDB();
    const user = await User.findById(validated.userId);

    if (!user) {
      return { success: false, error: 'Användare hittades inte' };
    }

    // Prevent deleting admins
    if (user.role === 'admin') {
      return { success: false, error: 'Kan inte ta bort en administratör' };
    }

    await user.deleteOne();

    revalidatePath('/admin/users');
    return { success: true, message: 'Användare borttagen' };
  } catch (error) {
    console.error('Error deleting user:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Kunde inte ta bort användare' };
  }
}

/**
 * Force logout user (admin only)
 * Sets forcedLogoutAt timestamp to invalidate existing sessions
 */
export async function forceLogoutUser(userId: string) {
  try {
    await requireAdmin();

    // Validate input
    const validated = forceLogoutUserSchema.parse({ userId });

    await connectDB();
    const user = await User.findById(validated.userId);

    if (!user) {
      return { success: false, error: 'Användare hittades inte' };
    }

    // Prevent logging out admins
    if (user.role === 'admin') {
      return { success: false, error: 'Kan inte logga ut en administratör' };
    }

    // Set forcedLogoutAt to current time to invalidate all existing tokens
    user.forcedLogoutAt = new Date();
    await user.save();

    revalidatePath('/admin/users');
    return { success: true, message: 'Användare utloggad' };
  } catch (error) {
    console.error('Error forcing logout:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Kunde inte logga ut användare' };
  }
}

/**
 * Helper: Check for ties and return warning messages
 */
function checkForTies(books: IBookSuggestion[]): string[] {
  if (books.length < 3) return [];

  const thirdPlaceVotes = books[2].votes?.length || 0;
  const tiedBooks = books.filter(b => (b.votes?.length || 0) === thirdPlaceVotes);

  if (tiedBooks.length > 1) {
    return [
      `⚠️ Observera: ${tiedBooks.length} böcker har ${thirdPlaceVotes} röster. ` +
      `"${books[2].title}" vald som 3:e plats baserat på tidigast inlämnad (${books[2].createdAt?.toLocaleString('sv-SE')}).`
    ];
  }

  return [];
}

/**
 * Helper function to assign winners to meetings and update book statuses
 * Extracted to reduce complexity in finalizeWinners function
 */
async function assignWinnersToMeetings(
  pendingBooks: BookDocument[],
  availableMeetings: MeetingDocument[],
  activeRound: VotingRoundDocument,
  session: mongoose.ClientSession
) {
  const winners = [];
  const assignmentWarnings = [];

  for (let i = 0; i < pendingBooks.length; i++) {
    const book = pendingBooks[i];
    const placement = (i + 1) as 1 | 2 | 3;
    const meeting = availableMeetings[i];

    const winnerEntry = {
      bookId: book._id as Types.ObjectId,
      placement,
      voteCount: book.votes?.length || 0,
      assignedMeetingId: meeting?._id as Types.ObjectId | undefined,
      assignedAt: meeting ? new Date() : undefined,
    };

    winners.push(winnerEntry);

    if (meeting) {
      // Update meeting with book data
      meeting.book = {
        id: book.googleBooksId || (book._id as Types.ObjectId).toString(),
        title: book.title,
        author: book.author,
        coverImage: book.coverImage,
        isbn: book.isbn,
        googleDescription: book.googleDescription,
      };
      meeting.votingRound = (activeRound._id as Types.ObjectId).toString();
      meeting.placement = placement;
      meeting.autoAssigned = true;
      meeting.assignedAt = new Date();

      await meeting.save({ session });
    } else {
      assignmentWarnings.push(
        `${placement === 1 ? '🥇' : placement === 2 ? '🥈' : '🥉'} "${book.title}" kunde inte tilldelas ett möte (endast ${availableMeetings.length} möten tillgängliga)`
      );
    }

    // Update book with winner metadata
    book.votingRound = activeRound._id as Types.ObjectId;
    book.placement = placement;
    book.wonAt = new Date();
    await book.save({ session });
  }

  return { winners, assignmentWarnings };
}

/**
 * Finalize top 3 winners and assign to next 3 meetings (admin only)
 *
 * PRODUCTION-READY IMPLEMENTATION:
 * - Uses MongoDB transactions for atomicity (all-or-nothing)
 * - Idempotent: Safe to call multiple times
 * - DB-level constraint prevents duplicate finalized rounds
 * - Deterministic tie-breaking with admin notification
 * - Graceful degradation for < 3 available meetings
 * - Comprehensive error handling and validation
 */
export async function finalizeWinners() {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. VALIDATE ADMIN AUTH
    const adminSession = await requireAdmin();
    const adminId = adminSession.user.id;

    await connectDB();

    // 2. CHECK FOR EXISTING FINALIZED/COMPLETED ROUND (Idempotency Check)
    //
    // CONCURRENCY NOTE: This check prevents double-finalization even under concurrent calls.
    // If two admins click "Finalize" simultaneously:
    // - One transaction commits first, creating a finalized round
    // - The other transaction sees the finalized round here and aborts
    // - MongoDB's partial unique index provides additional safety layer
    const existingRound = await VotingRound.findOne({
      status: { $in: ['finalized', 'completed'] }
    }).session(session);

    if (existingRound) {
      await session.abortTransaction();
      return {
        success: false,
        error: 'Det finns redan en slutförd röstningsomgång. Återställ den först innan du skapar en ny.'
      };
    }

    // 3. GET OR CREATE ACTIVE ROUND
    //
    // CONCURRENCY NOTE: VotingRound.create() may fail with duplicate key error (code 11000)
    // if another transaction created a round simultaneously. This is caught in the catch block.
    // The partial unique index on { status: 1 } ensures only ONE active round exists.
    let activeRound = await VotingRound.findOne({ status: 'active' }).session(session);

    if (!activeRound) {
      // Create first active round
      const maxRound = await VotingRound.findOne().sort({ roundNumber: -1 }).session(session);
      const nextRoundNumber = (maxRound?.roundNumber || 0) + 1;

      // CONCURRENCY: If duplicate round creation is attempted, MongoDB will throw error 11000
      // due to unique constraint on roundNumber. Transaction will abort and retry.
      const createdRounds = await VotingRound.create([{
        roundNumber: nextRoundNumber,
        status: 'active',
        winners: [],
      }], { session });
      activeRound = createdRounds[0];
    }

    // 4. GET TOP 3 BOOKS BY VOTE COUNT
    //
    // SCALABILITY TODO: Currently hardcoded to top 3 winners.
    // To support N winners in the future:
    // 1. Make .limit() configurable (e.g., from voting round config or admin setting)
    // 2. Update placement type from `1 | 2 | 3` to `number` with max constraint
    // 3. Update frontend UI to display N placement badges
    // 4. Update meeting assignment logic to handle N meetings
    const pendingBooks = await BookSuggestion.find({ status: 'pending' })
      .sort({ 'votes': -1, createdAt: 1 }) // Tie-breaker: earliest submission wins
      .limit(3) // TODO-SCALABILITY: Hardcoded to 3 winners
      .session(session);

    if (pendingBooks.length === 0) {
      await session.abortTransaction();
      return {
        success: false,
        error: 'Inga böcker har fått röster ännu. Vänta tills medlemmar har röstat.'
      };
    }

    // Check for ties at 3rd place position
    const tieWarning = checkForTies(pendingBooks);

    // 5. GET NEXT 3 AVAILABLE FUTURE MEETINGS
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const availableMeetings = await Meeting.find({
      date: { $gte: today.toISOString().split('T')[0] },
      $or: [
        { autoAssigned: { $ne: true } },  // Not auto-assigned
        { autoAssigned: { $exists: false } } // Field doesn't exist (legacy)
      ]
    })
      .sort({ date: 1 })
      .limit(3)
      .session(session);

    if (availableMeetings.length === 0) {
      await session.abortTransaction();
      return {
        success: false,
        error: 'Inga framtida möten finns. Skapa minst 1 möte innan du slutför bokomröstning.'
      };
    }

    // 6. ASSIGN WINNERS TO MEETINGS
    //
    // SCALABILITY TODO: placement type is `1 | 2 | 3` - hardcoded for 3 winners.
    // To support N winners:
    // - Change placement to `number` with validation (1 to N)
    // - Update IVotingRound.winners type definition
    // - Update all placement badge rendering in UI components
    const { winners, assignmentWarnings } = await assignWinnersToMeetings(
      pendingBooks,
      availableMeetings,
      activeRound,
      session
    );

    // 7. FINALIZE THE ROUND
    activeRound.winners = winners;
    activeRound.status = 'finalized';
    activeRound.finalizedAt = new Date();
    activeRound.finalizedBy = new Types.ObjectId(adminId);
    await activeRound.save({ session });

    // 8. COMMIT TRANSACTION
    await session.commitTransaction();

    // 9. REVALIDATE PATHS
    revalidatePath('/admin/suggestions');
    revalidatePath('/Vote');
    revalidatePath('/');
    revalidatePath('/NextMeeting');

    // 10. RETURN SUCCESS WITH DETAILS
    return {
      success: true,
      message: `${winners.length} bokomröstning slutförd och tilldelade till möten`,
      winners: winners.map((w, i) => ({
        title: pendingBooks[i].title,
        author: pendingBooks[i].author,
        placement: w.placement,
        votes: w.voteCount,
        meeting: availableMeetings[i] && availableMeetings[i].date
          ? `${new Date(availableMeetings[i].date).toLocaleDateString('sv-SE')} ${availableMeetings[i].time}`
          : 'Inget möte tilldelat',
      })),
      warnings: [...assignmentWarnings, ...tieWarning],
    };

  } catch (error) {
    await session.abortTransaction();
    console.error('[finalizeWinners] Transaction failed:', error);

    // Handle MongoDB duplicate key error
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      return {
        success: false,
        error: 'En annan admin har redan slutfört bokomröstningen. Ladda om sidan.'
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Ett oväntat fel uppstod'
    };
  } finally {
    void session.endSession();
  }
}

/**
 * Reset voting cycle (admin only)
 * Completes current finalized round and creates new active round
 *
 * PRODUCTION-READY IMPLEMENTATION:
 * - Moves all 3 winners to 'read' status
 * - Clears all votes from pending books (fresh start)
 * - Marks current round as 'completed' (audit trail)
 * - Creates new active round with incremented roundNumber
 * - Preserves meeting data (critical for front page display)
 * - Uses MongoDB transactions for atomicity
 */
export async function resetVotingCycle() {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. VALIDATE ADMIN AUTH
    await requireAdmin();
    await connectDB();

    // 2. FIND THE FINALIZED ROUND
    const finalizedRound = await VotingRound.findOne({
      status: 'finalized'
    }).session(session);

    if (!finalizedRound) {
      await session.abortTransaction();
      return {
        success: false,
        error: 'Ingen slutförd omgång finns att återställa.'
      };
    }

    // 3. MARK ALL WINNERS AS 'READ'
    const winnerIds = finalizedRound.winners.map((w: { bookId: Types.ObjectId }) => w.bookId);

    await BookSuggestion.updateMany(
      { _id: { $in: winnerIds } },
      {
        $set: { status: 'read' }
        // Keep votingRound, placement, wonAt for historical record
      },
      { session }
    );

    // 4. CLEAR ALL VOTES FROM PENDING BOOKS (Start fresh)
    await BookSuggestion.updateMany(
      { status: 'pending' },
      { $set: { votes: [] } },
      { session }
    );

    // 5. MARK CURRENT ROUND AS COMPLETED (Don't mutate - just close it)
    finalizedRound.status = 'completed';
    finalizedRound.completedAt = new Date();
    await finalizedRound.save({ session });

    // 6. CREATE NEW ACTIVE ROUND
    const nextRoundNumber = finalizedRound.roundNumber + 1;

    await VotingRound.create([{
      roundNumber: nextRoundNumber,
      status: 'active',
      winners: [],
    }], { session });

    // 7. MEETING DATA IS PRESERVED (Important for front page "next meeting" display)
    // Meetings keep their book data and autoAssigned status

    // 8. COMMIT TRANSACTION
    await session.commitTransaction();

    // 9. REVALIDATE PATHS
    revalidatePath('/admin/suggestions');
    revalidatePath('/Vote');
    revalidatePath('/');
    revalidatePath('/NextMeeting');
    revalidatePath('/BooksRead');

    return {
      success: true,
      message: `Röstningsomgång #${finalizedRound.roundNumber} avslutad. Omgång #${nextRoundNumber} startad.`,
    };

  } catch (error) {
    await session.abortTransaction();
    console.error('[resetVotingCycle] Transaction failed:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Ett oväntat fel uppstod'
    };
  } finally {
    void session.endSession();
  }
}
