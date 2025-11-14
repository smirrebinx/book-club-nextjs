import Image from 'next/image';
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import BookSuggestion from '@/models/BookSuggestion';
import User from '@/models/User';

import { AddSuggestionForm } from './AddSuggestionForm';
import { SuggestionsList } from './SuggestionsList';

// Force dynamic rendering - don't pre-render at build time
export const dynamic = 'force-dynamic';

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

  // Get all suggestions
  const suggestions = await BookSuggestion.find({
    status: { $in: ['pending', 'approved', 'currently_reading'] },
  })
    .sort({ createdAt: -1 })
    .lean();

  // Manually fetch users to avoid populate issues with MongoDB adapter
  const userIds = suggestions.map(s => s.suggestedBy).filter(Boolean);
  const users = await User.find({ _id: { $in: userIds } }).lean();
  const userMap = new Map(users.map(u => [u._id.toString(), u]));

  const suggestionsData = suggestions.map((s) => {
    const userId = s.suggestedBy?.toString() || '';
    const user = userId ? userMap.get(userId) : null;
    const userName = user?.name || 'Okänd';

    return {
      _id: s._id.toString(),
      title: s.title,
      author: s.author,
      description: s.description || '',
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
      <div className="max-w-7xl mx-auto px-4">
        {/* Hero Section with SVG */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-6 w-full max-w-[200px]">
            <Image
              src="/animations/undraw_book-lover_m9n3.svg"
              alt="Book lover illustration"
              width={200}
              height={150}
              className="w-full h-auto"
              priority
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Bokförslag</h1>
          <p className="text-gray-600">
            Här kan du föreslå böcker till bokklubben och se vilka böcker andra har föreslagit.
          </p>
        </div>

        {/* Two-column layout on larger screens, stacked on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form on left/top - takes 1 column on large screens */}
          <div className="lg:col-span-1">
            <AddSuggestionForm />
          </div>

          {/* Suggestions list on right/bottom - takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <SuggestionsList
              suggestions={suggestionsData}
              currentUserId={session.user.id}
              userRole={session.user.role}
            />
          </div>
        </div>
      </div>
    </div>
  );
}