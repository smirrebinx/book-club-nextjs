import Image from 'next/image';
import { redirect } from 'next/navigation';

import { APP_NAME } from "@/constants";
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
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
    suggestedBy: { name: userName },
    createdAt: s.createdAt?.toISOString() || new Date().toISOString(),
    coverImage: s.coverImage,
    isbn: s.isbn,
    googleDescription: s.googleDescription,
  };
}

/**
 * Separate suggestions by status
 * Note: We prioritize currently_reading as the winner if it exists
 */
function categorizeBooks(suggestionsData: VoteSuggestion[]) {
  const currentlyReading = suggestionsData.find(s => s.status === 'currently_reading');
  const approved = suggestionsData.find(s => s.status === 'approved');

  return {
    // Show currently_reading as winner if it exists, otherwise show approved
    approvedBook: currentlyReading || approved,
    currentlyReadingBook: currentlyReading,
    pendingBooks: suggestionsData.filter(s => s.status === 'pending'),
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
function VotePageContent({ approvedBook, currentlyReadingBook, pendingBooks }: {
  approvedBook?: VoteSuggestion;
  currentlyReadingBook?: VoteSuggestion;
  pendingBooks: VoteSuggestion[];
}) {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
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

        {/* Winner Section */}
        {approvedBook && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Vinnare</h2>
            <VotingList suggestions={[approvedBook]} />
          </div>
        )}

        {pendingBooks.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Rösta på böcker</h2>
            <VotingList suggestions={pendingBooks} />
          </div>
        )}

        {pendingBooks.length === 0 && !approvedBook && !currentlyReadingBook && (
          <div className="text-center py-12">
            <p className="text-gray-600">Inga bokförslag finns ännu. Lägg till ett förslag!</p>
          </div>
        )}
      </div>
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

    const suggestionsData = await fetchSuggestionData(session.user.id);
    const { approvedBook, currentlyReadingBook, pendingBooks } = categorizeBooks(suggestionsData);

    return (
      <VotePageContent
        approvedBook={approvedBook}
        currentlyReadingBook={currentlyReadingBook}
        pendingBooks={pendingBooks}
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
