import connectDB from '@/lib/mongodb';
import BookSuggestion from '@/models/BookSuggestion';

import { AdminSuggestionsTable } from './AdminSuggestionsTable';

export default async function AdminSuggestionsPage() {
  await connectDB();

  const suggestions = await BookSuggestion.find({})
    .populate('suggestedBy', 'name email')
    .sort({ createdAt: -1 })
    .lean();

  const suggestionsData = suggestions.map((s) => ({
    _id: s._id.toString(),
    title: s.title,
    author: s.author,
    description: s.description,
    status: s.status,
    voteCount: s.votes?.length || 0,
    suggestedBy: {
      name: s.suggestedBy?.name || 'Okänd',
      email: s.suggestedBy?.email || '',
    },
    createdAt: s.createdAt?.toISOString() || new Date().toISOString(),
  }));

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
