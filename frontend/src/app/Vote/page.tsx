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
  try {
    console.log('[Vote] Starting Vote page render');
    const session = await auth();
    console.log('[Vote] Session retrieved, user:', session?.user?.id);

    // Redirect pending users
    if (session?.user && !session.user.isApproved) {
      console.log('[Vote] User not approved, redirecting to pending');
      redirect('/auth/pending');
    }

    if (!session?.user) {
      console.log('[Vote] No session, redirecting to signin');
      redirect('/auth/signin');
    }

    console.log('[Vote] Connecting to database...');
    await connectDB();
    console.log('[Vote] Database connected');

    // Get all suggestions with pending status for voting
    console.log('[Vote] Fetching suggestions...');
    const suggestions = await BookSuggestion.find({
      status: { $in: ['pending', 'approved', 'currently_reading'] },
    })
      .populate('suggestedBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    console.log('[Vote] Found', suggestions.length, 'suggestions');

    console.log('[Vote] Mapping suggestions data...');
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

    console.log('[Vote] Rendering page with', suggestionsData.length, 'suggestions');
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
  } catch (error) {
    console.error('[Vote] ERROR:', error);
    console.error('[Vote] Error stack:', error instanceof Error ? error.stack : 'No stack');
    console.error('[Vote] Error details:', JSON.stringify(error, null, 2));

    // Show detailed error to help debug in production (remove after fixing)
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h1 className="text-2xl font-bold text-red-800 mb-4">Ett fel uppstod</h1>
            <div className="text-sm text-red-700 space-y-2">
              <p><strong>Felmeddelande:</strong></p>
              <pre className="bg-white p-4 rounded border border-red-300 overflow-auto">
                {error instanceof Error ? error.message : 'Okänt fel'}
              </pre>
              {error instanceof Error && error.stack && (
                <>
                  <p className="mt-4"><strong>Stack trace:</strong></p>
                  <pre className="bg-white p-4 rounded border border-red-300 overflow-auto text-xs">
                    {error.stack}
                  </pre>
                </>
              )}
              <p className="mt-4 text-red-600">
                Om du ser detta meddelande, vänligen skicka en skärmdump till administratören.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
