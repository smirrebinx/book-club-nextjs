import Image from 'next/image';
import { redirect } from 'next/navigation';

import { AutoRefresh } from '@/components/AutoRefresh';
import { APP_NAME } from "@/constants";
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { getCurrentVotingRound } from '@/lib/voting-helpers';
import BookSuggestion from '@/models/BookSuggestion';
import User from '@/models/User';

import { VotingList } from './VotingList';

import type { SuggestionStatus } from '@/models/BookSuggestion';

export const metadata = {
  title: `Rösta - ${APP_NAME}`,
  description: "Rösta på nästa bok som bokklubben ska läsa.",
};

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Type definitions
interface LeanUser {
  _id: { toString: () => string };
  name?: string;
  email?: string;
}

interface LeanSuggestion {
  _id: { toString: () => string };
  suggestedBy?: { toString: () => string };
  title: string;
  author: string;
  description?: string;
  status: SuggestionStatus;
  votes?: { toString: () => string }[];
  placement?: 1 | 2 | 3;
  votingRound?: { toString: () => string };
  createdAt?: Date;
  coverImage?: string;
  isbn?: string;
  googleDescription?: string;
}

interface VoteSuggestion {
  _id: string;
  title: string;
  author: string;
  description: string;
  status: SuggestionStatus;
  votes: string[];
  voteCount: number;
  hasVoted: boolean;
  placement?: 1 | 2 | 3;
  votingRound?: string;
  suggestedBy: { name: string };
  createdAt: string;
  coverImage?: string;
  isbn?: string;
  googleDescription?: string;
}

/**
 * Fetch users and create a map for quick lookup
 */
async function fetchUsersMap(userIds: unknown[]): Promise<Map<string, LeanUser>> {
  console.log('[Vote] Fetching users...');
  const users = await User.find({ _id: { $in: userIds } }).lean() as LeanUser[];
  console.log('[Vote] Found', users.length, 'users');

  if (users.length === 0 && userIds.length > 0) {
    const allUsers = await User.find({}).limit(5).lean() as LeanUser[];
    console.log('[Vote] Total users in database:', allUsers.length);
  }

  return new Map(users.map(u => [u._id.toString(), u]));
}

/**
 * Map a single suggestion to frontend format
 */
function mapSuggestion(s: LeanSuggestion, userMap: Map<string, LeanUser>, userId: string): VoteSuggestion {
  const suggestedById = s.suggestedBy?.toString();
  const user = suggestedById ? userMap.get(suggestedById) : null;
  const userName = user?.name || 'Okänd';

  return {
    _id: s._id.toString(),
    title: s.title,
    author: s.author,
    description: s.description || '',
    status: s.status,
    votes: s.votes?.map((v) => v.toString()) || [],
    voteCount: s.votes?.length || 0,
    hasVoted: s.votes?.some((v) => v.toString() === userId) || false,
    placement: s.placement,
    votingRound: s.votingRound?.toString(),
    suggestedBy: { name: userName },
    createdAt: s.createdAt?.toISOString() || new Date().toISOString(),
    coverImage: s.coverImage,
    isbn: s.isbn,
    googleDescription: s.googleDescription,
  };
}

/**
 * Separate suggestions by placement (winners) and pending status
 */
function categorizeBooks(suggestionsData: VoteSuggestion[]) {
  // Get winners (books with placement 1, 2, or 3) sorted by placement
  const winners = suggestionsData
    .filter(s => s.placement)
    .sort((a, b) => (a.placement || 0) - (b.placement || 0));

  // Get pending books (no placement)
  const pendingBooks = suggestionsData.filter(s => s.status === 'pending' && !s.placement);

  return {
    winners,
    pendingBooks,
  };
}

/**
 * Fetch and prepare suggestion data
 */
async function fetchSuggestionData(userId: string) {
  await connectDB();

  const suggestions = await BookSuggestion.find({
    status: { $in: ['pending', 'approved', 'currently_reading'] },
  })
    .sort({ createdAt: -1 })
    .lean() as LeanSuggestion[];

  const userIds = suggestions.map(s => s.suggestedBy).filter(Boolean);
  const userMap = await fetchUsersMap(userIds);

  return suggestions.map(s => mapSuggestion(s, userMap, userId));
}

/**
 * Render the voting page content
 */
function VotePageContent({ winners, pendingBooks, roundNumber, isVotingLocked }: {
  winners: VoteSuggestion[];
  pendingBooks: VoteSuggestion[];
  roundNumber?: number;
  isVotingLocked: boolean;
}) {
  return (
    <div
      className="flex min-h-screen items-start justify-center"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--secondary-text)",
      }}
    >
      <AutoRefresh interval={30} />
      <main
        className="flex w-full max-w-3xl flex-col items-start gap-8 px-4 py-4 sm:px-16 sm:py-8"
        style={{ backgroundColor: "var(--background)" }}
      >
        <div className="flex w-full flex-col items-start gap-6 text-left">
          <div className="flex w-full justify-center sm:justify-start">
            <Image
              src="/animations/undraw_election-day_puwv.svg"
              alt="Voting illustration"
              width={200}
              height={150}
              className="w-full h-auto max-w-[200px]"
              priority
            />
          </div>

          {/* Page Heading */}
          <h1
            className="px-4 text-3xl leading-10 tracking-wide sm:px-0"
            style={{
              fontFamily: "var(--font-heading)",
              color: "var(--primary-text)",
            }}
          >
            Rösta
          </h1>
          <p
            className="max-w-md px-4 text-lg leading-8 sm:px-0"
            style={{
              fontFamily: "var(--font-body)",
              color: "var(--secondary-text)",
            }}
          >
            Rösta på vilken bok du vill att bokklubben ska läsa nästa gång.
          </p>
        </div>

        {/* Winners Section - Show 3 winners when voting is finalized */}
        {winners.length > 0 && (
          <div className="w-full px-4 sm:px-0">
            <h2
              className="text-2xl font-semibold mb-4 flex items-center gap-2"
              style={{
                fontFamily: "var(--font-heading)",
                color: "var(--primary-text)",
              }}
            >
              <span>🏆</span>
              <span>
                Vinnare {roundNumber ? `från omgång #${roundNumber}` : ''}
              </span>
            </h2>
            <VotingList suggestions={winners} isVotingLocked={true} />
          </div>
        )}

        {/* Voting Locked Message */}
        {isVotingLocked && pendingBooks.length > 0 && (
          <div className="w-full px-4 sm:px-0">
            <div
              className="mb-6 p-4 rounded-lg border-2"
              style={{
                backgroundColor: "var(--background)",
                borderColor: "var(--link-color)",
              }}
            >
              <p
                className="text-base font-medium"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--primary-text)",
                }}
              >
                📚 Röstning är låst tills nästa omgång
              </p>
              <p
                className="text-sm mt-2"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--secondary-text)",
                }}
              >
                {winners.length} {winners.length === 1 ? 'vinnare' : 'vinnare'} har slutförts. Vänta tills administratören startar en ny röstningsomgång.
              </p>
            </div>
          </div>
        )}

        {pendingBooks.length > 0 && (
          <div className="w-full px-4 sm:px-0">
            <h2
              className="text-2xl font-semibold mb-4"
              style={{
                fontFamily: "var(--font-heading)",
                color: "var(--primary-text)",
              }}
            >
              {isVotingLocked ? "Böcker i omgången" : "Rösta på böcker"}
            </h2>
            <VotingList suggestions={pendingBooks} isVotingLocked={isVotingLocked} />
          </div>
        )}

        {pendingBooks.length === 0 && winners.length === 0 && (
          <div className="w-full px-4 sm:px-0 py-12">
            <p
              className="text-lg"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--secondary-text)",
              }}
            >
              Inga bokförslag finns ännu. Lägg till ett förslag!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default async function Vote() {
  try {
    const session = await auth();

    if (session?.user && !session.user.isApproved) {
      redirect('/auth/pending');
    }

    if (!session?.user) {
      redirect('/auth/signin');
    }

    // Get current voting round status
    await connectDB();
    const { round, isActive } = await getCurrentVotingRound();
    const isVotingLocked = !isActive;

    const suggestionsData = await fetchSuggestionData(session.user.id);
    const { winners, pendingBooks } = categorizeBooks(suggestionsData);

    return (
      <VotePageContent
        winners={winners}
        pendingBooks={pendingBooks}
        roundNumber={round?.roundNumber}
        isVotingLocked={isVotingLocked}
      />
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
