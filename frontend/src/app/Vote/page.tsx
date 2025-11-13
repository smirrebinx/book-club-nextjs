import Image from 'next/image';
import { redirect } from 'next/navigation';

import { APP_NAME } from "@/constants";
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import BookSuggestion from '@/models/BookSuggestion';

import { VotingList } from './VotingList';

export const metadata = {
  title: `Rösta - ${APP_NAME}`,
  description: "Rösta på nästa bok som bokklubben ska läsa.",
};

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function Vote() {
  const session = await auth();

  // Redirect pending users
  if (session?.user && !session.user.isApproved) {
    redirect('/auth/pending');
  }

  if (!session?.user) {
    redirect('/auth/signin');
  }

  await connectDB();

  // Get all suggestions with pending status for voting
  const suggestions = await BookSuggestion.find({
    status: { $in: ['pending', 'approved', 'currently_reading'] },
  })
    .populate('suggestedBy', 'name email')
    .sort({ createdAt: -1 })
    .lean();

  const suggestionsData = suggestions.map((s) => {
    const suggestedByRaw = s.suggestedBy as unknown;
    let userName = 'Okänd';

    if (
      suggestedByRaw &&
      typeof suggestedByRaw === 'object' &&
      'name' in suggestedByRaw
    ) {
      const populatedUser = suggestedByRaw as { name?: string };
      userName = populatedUser.name || 'Okänd';
    }

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
        name: userName,
      },
      createdAt: s.createdAt?.toISOString() || new Date().toISOString(),
    };
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Hero Section with SVG */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-6 w-full max-w-[200px]">
            <Image
              src="/animations/undraw_election-day_puwv.svg"
              alt="Voting illustration"
              width={200}
              height={150}
              className="w-full h-auto"
              priority
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Rösta</h1>
          <p className="text-gray-600">
            Rösta på vilken bok du vill att bokklubben ska läsa nästa gång.
          </p>
        </div>

        <VotingList suggestions={suggestionsData} />
      </div>
    </div>
  );
}
