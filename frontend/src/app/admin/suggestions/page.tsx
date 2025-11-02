import connectDB from '@/lib/mongodb';
import BookSuggestion from '@/models/BookSuggestion';

import { AdminSuggestionsTable } from './AdminSuggestionsTable';

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

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Bokförslag</h1>
        <p className="text-gray-600 mt-2">Hantera och godkänn bokförslag</p>
      </div>

      <AdminSuggestionsTable suggestions={suggestionsData} />
    </div>
  );
}
