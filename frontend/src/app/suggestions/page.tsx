import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import BookSuggestion from '@/models/BookSuggestion';

import { AddSuggestionForm } from './AddSuggestionForm';
import { SuggestionsList } from './SuggestionsList';

export default async function SuggestionsPage() {
  const session = await auth();

  // Redirect pending users
  if (session?.user && !session.user.isApproved) {
    redirect('/auth/pending');
  }

  if (!session?.user) {
    redirect('/auth/signin');
  }

  await connectDB();

  // Get all suggestions with populated user data
  const suggestions = await BookSuggestion.find({
    status: { $in: ['pending', 'approved', 'currently_reading'] },
  })
    .populate('suggestedBy', 'name email')
    .sort({ createdAt: -1 })
    .lean();

  const suggestionsData = suggestions.map((s) => {
    // Type assertion: suggestedBy could be ObjectId or populated user object
    const suggestedByRaw = s.suggestedBy as unknown;
    let userId = '';
    let userName = 'Okänd';

    // Check if it's a populated user object (has name property)
    if (
      suggestedByRaw &&
      typeof suggestedByRaw === 'object' &&
      'name' in suggestedByRaw
    ) {
      const populatedUser = suggestedByRaw as { _id?: { toString(): string }; name?: string };
      userId = populatedUser._id?.toString() || '';
      userName = populatedUser.name || 'Okänd';
    }

    return {
      _id: s._id.toString(),
      title: s.title,
      author: s.author,
      description: s.description,
      status: s.status,
      votes: s.votes?.map((v) => v.toString()) || [],
      voteCount: s.votes?.length || 0,
      hasVoted: s.votes?.some((v) => v.toString() === session.user.id) || false,
      suggestedBy: {
        _id: userId,
        name: userName,
      },
      createdAt: s.createdAt?.toISOString() || new Date().toISOString(),
    };
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Bokförslag</h1>
          <p className="text-gray-600">
            Föreslå böcker och rösta på dina favoriter
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <SuggestionsList
              suggestions={suggestionsData}
              currentUserId={session.user.id}
              userRole={session.user.role}
            />
          </div>

          <div>
            <AddSuggestionForm />
          </div>
        </div>
      </div>
    </div>
  );
}