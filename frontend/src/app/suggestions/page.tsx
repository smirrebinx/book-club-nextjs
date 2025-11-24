import Image from 'next/image';
import { redirect } from 'next/navigation';

import { AutoRefresh } from '@/components/AutoRefresh';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import BookSuggestion from '@/models/BookSuggestion';
import User from '@/models/User';

import { AddSuggestionForm } from './AddSuggestionForm';
import { SuggestionsList } from './SuggestionsList';

// Force dynamic rendering - don't pre-render at build time
export const dynamic = 'force-dynamic';

export default async function SuggestionsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();

  // Redirect pending users
  if (session?.user && !session.user.isApproved) {
    redirect('/auth/pending');
  }

  if (!session?.user) {
    redirect('/auth/signin');
  }

  await connectDB();

  const params = await searchParams;
  const search = (params.search as string) || '';

  // Build query with search
  interface SuggestionQuery {
    status: { $in: string[] };
    $or?: Array<{
      title?: { $regex: string; $options: string };
      author?: { $regex: string; $options: string };
      description?: { $regex: string; $options: string };
    }>;
  }

  const query: SuggestionQuery = {
    status: { $in: ['pending', 'approved', 'currently_reading'] },
  };

  // Add search filter
  if (search) {
    // Escape special regex characters for security
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.$or = [
      { title: { $regex: escapedSearch, $options: 'i' } },
      { author: { $regex: escapedSearch, $options: 'i' } },
      { description: { $regex: escapedSearch, $options: 'i' } },
    ];
  }

  // Get all suggestions with search filter
  const suggestions = await BookSuggestion.find(query)
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
      coverImage: s.coverImage,
      isbn: s.isbn,
      googleDescription: s.googleDescription,
    };
  });

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
        <div className="flex w-full flex-col items-start gap-6 text-left px-4 sm:px-0">
          <div className="flex w-full justify-center sm:justify-start">
            <Image
              src="/animations/undraw_book-lover_m9n3.svg"
              alt="Book lover illustration"
              width={200}
              height={150}
              className="w-full h-auto max-w-[200px]"
              priority
            />
          </div>

          {/* Page Heading */}
          <h1
            className="text-3xl leading-10 tracking-wide"
            style={{
              fontFamily: "var(--font-heading)",
              color: "var(--primary-text)",
            }}
          >
            Bokförslag
          </h1>
          <p
            className="max-w-md text-lg leading-8"
            style={{
              fontFamily: "var(--font-body)",
              color: "var(--secondary-text)",
            }}
          >
            Föreslå en bok och se vad andra tipsar om.
          </p>
        </div>

        {/* Add Suggestion Form */}
        <div className="w-full px-4 sm:px-0">
          <AddSuggestionForm />
        </div>

        {/* Suggestions list */}
        <div className="w-full px-4 sm:px-0">
          <h2
            className="text-2xl font-semibold mb-4"
            style={{
              fontFamily: "var(--font-heading)",
              color: "var(--primary-text)",
            }}
          >
            Föreslagna böcker
          </h2>
          <SuggestionsList
            suggestions={suggestionsData}
            currentUserId={session.user.id}
            userRole={session.user.role}
            currentSearch={search}
          />
        </div>
      </main>
    </div>
  );
}