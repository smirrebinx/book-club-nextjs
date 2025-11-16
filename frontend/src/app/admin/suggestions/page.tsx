import { AutoRefresh } from '@/components/AutoRefresh';
import connectDB from '@/lib/mongodb';
import BookSuggestion from '@/models/BookSuggestion';

import { AdminSuggestionsTable } from './AdminSuggestionsTable';
import { ResetVotingButton } from './ResetVotingButton';

// Force dynamic rendering - don't pre-render at build time
export const dynamic = 'force-dynamic';

export default async function AdminSuggestionsPage() {
  await connectDB();

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
      suggestedBy: {
        name: userName,
        email: userEmail,
      },
      createdAt: s.createdAt?.toISOString() || new Date().toISOString(),
    };
  });

  // Check if there's a currently_reading or approved book
  const hasActiveVotingCycle = suggestions.some(
    s => s.status === 'currently_reading' || s.status === 'approved'
  );

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

      <AdminSuggestionsTable suggestions={suggestionsData} />
    </div>
  );
}
