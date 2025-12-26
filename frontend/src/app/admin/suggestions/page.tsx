import { AutoRefresh } from '@/components/AutoRefresh';
import connectDB from '@/lib/mongodb';
import { getCurrentVotingRound } from '@/lib/voting-helpers';
import BookSuggestion from '@/models/BookSuggestion';
import Meeting from '@/models/Meeting';
// Import User model to ensure schema is registered for populate
import '@/models/User';

import { AdminSuggestionsTable } from './AdminSuggestionsTable';
import { FinalizeWinnersButton } from './FinalizeWinnersButton';
import { ResetVotingButton } from './ResetVotingButton';

// Force dynamic rendering - don't pre-render at build time
export const dynamic = 'force-dynamic';

export default async function AdminSuggestionsPage() {
  await connectDB();

  // Get current voting round status
  const { round } = await getCurrentVotingRound();
  const isFinalized = round?.status === 'finalized';

  const suggestions = await BookSuggestion.find({})
    .populate('suggestedBy', 'name email')
    .sort({ createdAt: -1 })
    .lean();

  const suggestionsData = suggestions.map((s) => {
    // Type assertion: suggestedBy could be ObjectId or populated user object
    // We handle both cases safely
    const suggestedByRaw = s.suggestedBy as unknown;
    let userName = 'Okänd';
    let userEmail = '';

    // Check if it's a populated user object (has name property)
    if (
      suggestedByRaw &&
      typeof suggestedByRaw === 'object' &&
      'name' in suggestedByRaw
    ) {
      const populatedUser = suggestedByRaw as { name?: string; email?: string };
      userName = populatedUser.name || 'Okänd';
      userEmail = populatedUser.email || '';
    }

    return {
      _id: s._id.toString(),
      title: s.title,
      author: s.author,
      description: s.description,
      status: s.status,
      voteCount: s.votes?.length || 0,
      placement: s.placement,
      votingRound: s.votingRound?.toString(),
      suggestedBy: {
        name: userName,
        email: userEmail,
      },
      createdAt: s.createdAt?.toISOString() || new Date().toISOString(),
    };
  });

  // Sort suggestions: winners first (by placement), then by vote count
  const sortedSuggestions = [...suggestionsData].sort((a, b) => {
    // Winners first (placement 1, 2, 3)
    if (a.placement && !b.placement) return -1;
    if (!a.placement && b.placement) return 1;
    if (a.placement && b.placement) {
      return a.placement - b.placement; // 1st, 2nd, 3rd
    }

    // Then by vote count descending
    if (a.voteCount !== b.voteCount) {
      return b.voteCount - a.voteCount;
    }

    // Finally by creation date (oldest first for tie-breaking)
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  // Get top 3 pending candidates (for FinalizeWinnersButton)
  const topCandidates = suggestionsData
    .filter(s => s.status === 'pending')
    .sort((a, b) => {
      if (a.voteCount !== b.voteCount) {
        return b.voteCount - a.voteCount;
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    })
    .slice(0, 3)
    .map(s => ({
      _id: s._id,
      title: s.title,
      author: s.author,
      voteCount: s.voteCount,
    }));

  // Get next 3 available future meetings
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const availableMeetings = await Meeting.find({
    date: { $gte: today.toISOString().split('T')[0] },
    $or: [
      { autoAssigned: { $ne: true } },
      { autoAssigned: { $exists: false } }
    ]
  })
    .sort({ date: 1 })
    .limit(3)
    .lean();

  const meetingsData = availableMeetings.map(m => ({
    _id: m._id.toString(),
    date: m.date || '',
    time: m.time || '',
    location: m.location || '',
  }));

  // Prepare finalized round data if applicable
  let finalizedRoundData = undefined;
  if (isFinalized && round) {
    const winners = await Promise.all(
      round.winners.map(async (w) => {
        const book = await BookSuggestion.findById(w.bookId).lean();
        const meeting = w.assignedMeetingId
          ? await Meeting.findById(w.assignedMeetingId).lean()
          : null;

        return {
          title: book?.title || 'Okänd',
          author: book?.author || 'Okänd',
          placement: w.placement,
          votes: w.voteCount,
          meeting: meeting && meeting.date
            ? `${new Date(meeting.date).toLocaleDateString('sv-SE')} kl ${meeting.time}`
            : 'Inget möte tilldelat',
        };
      })
    );

    finalizedRoundData = {
      roundNumber: round.roundNumber,
      finalizedAt: round.finalizedAt?.toISOString() || new Date().toISOString(),
      winners,
    };
  }

  // Check if there's a finalized round (for ResetVotingButton)
  const hasActiveVotingCycle = isFinalized;

  return (
    <div>
      <AutoRefresh interval={10} />
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Bokförslag</h1>
          <p className="text-sm md:text-base text-gray-600 mt-2">Hantera och godkänn bokförslag</p>
        </div>
        <ResetVotingButton hasActiveVotingCycle={hasActiveVotingCycle} />
      </div>

      <div className="mb-6">
        <FinalizeWinnersButton
          topCandidates={topCandidates}
          availableMeetings={meetingsData}
          isFinalized={isFinalized}
          finalizedRound={finalizedRoundData}
        />
      </div>

      <AdminSuggestionsTable suggestions={sortedSuggestions} />
    </div>
  );
}
