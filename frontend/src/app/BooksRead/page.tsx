import { AutoRefresh } from "@/components/AutoRefresh";
import LottieAnimation from "@/components/LottieAnimation";
import { StatCard, StatGrid } from "@/components/StatCard";
import { APP_NAME } from "@/constants";
import connectDB from "@/lib/mongodb";
import BookSuggestion from "@/models/BookSuggestion";
// Import User model to ensure schema is registered for populate
import "@/models/User";

import { ReadBooksList } from "./ReadBooksList";

export const metadata = {
  title: `Lästa böcker - ${APP_NAME}`,
  description: "Se alla böcker som bokklubben har läst och diskuterat.",
};

// Force dynamic rendering for live updates
export const dynamic = "force-dynamic";

export default async function BooksRead({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await connectDB();

  const params = await searchParams;
  const search = (params.search as string) || '';

  // Fetch the book currently being read (no search filter)
  const currentlyReadingBooks = await BookSuggestion.find({ status: "currently_reading" })
    .populate("suggestedBy", "name")
    .sort({ updatedAt: -1 })
    .lean();

  // Build query for read books with search
  interface ReadBooksQuery {
    status: string;
    $or?: Array<{
      title?: { $regex: string; $options: string };
      author?: { $regex: string; $options: string };
      description?: { $regex: string; $options: string };
    }>;
  }

  const readBooksQuery: ReadBooksQuery = { status: "read" };

  // Add search filter
  if (search) {
    // Escape special regex characters for security
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    readBooksQuery.$or = [
      { title: { $regex: escapedSearch, $options: 'i' } },
      { author: { $regex: escapedSearch, $options: 'i' } },
      { description: { $regex: escapedSearch, $options: 'i' } },
    ];
  }

  // Fetch books marked as read with search filter
  const readBooks = await BookSuggestion.find(readBooksQuery)
    .populate("suggestedBy", "name")
    .sort({ updatedAt: -1 })
    .lean();

  // Helper function to normalize book data
  const normalizeBook = (book: typeof readBooks[0]) => {
    const suggestedByRaw = book.suggestedBy as unknown;

    let userName = "Okänd";
    if (
      suggestedByRaw &&
      typeof suggestedByRaw === "object" &&
      "name" in suggestedByRaw
    ) {
      const populatedUser = suggestedByRaw as { name?: string };
      userName = populatedUser.name || "Okänd";
    }

    return {
      _id: book._id.toString(),
      title: book.title,
      author: book.author,
      description: book.description || "",
      googleDescription: book.googleDescription,
      coverImage: book.coverImage,
      isbn: book.isbn,
      suggestedBy: { name: userName },
      createdAt: book.createdAt?.toISOString() || new Date().toISOString(),
    };
  };

  // Normalize the books into frontend-friendly objects
  const currentlyReadingData = currentlyReadingBooks.map(normalizeBook);
  const booksData = readBooks.map(normalizeBook);

  // ----------------------------------------------
  // Stats
  // ----------------------------------------------
  const totalReadBooks = booksData.length;

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
          {/* Top animation */}
          <div className="flex w-full justify-center sm:justify-start">
            <LottieAnimation
              src="/animations/booksStack.lottie"
              width={200}
              height={200}
              ariaLabel="Animerad bokstack"
              isDecorative={false}
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
            Lästa böcker
          </h1>
          <p
            className="max-w-md px-4 text-lg leading-8 sm:px-0"
            style={{
              fontFamily: "var(--font-body)",
              color: "var(--secondary-text)",
            }}
          >
            Här kan du se vilken bok bokklubben läser just nu och vilka böcker vi har läst tidigare.
          </p>

          {/* Stats Section */}
          <div className="w-full px-4 sm:px-0" style={{ color: 'inherit' }}>
            <StatGrid columns={3}>
              <StatCard
                label="Antal lästa böcker"
                value={totalReadBooks}
                description="Totalt antal böcker lästa av bokklubben"
                variant="primary"
              />
            </StatGrid>
          </div>

          {/* Currently Reading Section */}
          {currentlyReadingData.length > 0 && (
            <div className="w-full px-4 sm:px-0">
              <h2
                className="text-2xl font-bold mb-4"
                style={{
                  fontFamily: "var(--font-heading)",
                  color: "var(--primary-text)",
                }}
              >
                Läser nu
              </h2>
              <div
                className="flex w-full flex-col gap-6"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--secondary-text)",
                }}
              >
                <ReadBooksList books={currentlyReadingData} currentSearch="" showSearch={false} />
              </div>
            </div>
          )}

          {/* Read Books List */}
          <div className="w-full px-4 sm:px-0">
            <h2
              className="text-2xl font-bold mb-4"
              style={{
                fontFamily: "var(--font-heading)",
                color: "var(--primary-text)",
              }}
            >
              Lästa böcker
            </h2>
            <div
              className="flex w-full flex-col gap-6"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--secondary-text)",
              }}
            >
              <ReadBooksList books={booksData} currentSearch={search} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}