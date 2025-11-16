import LottieAnimation from "@/components/LottieAnimation";
import { StatCard, StatGrid } from "@/components/StatCard";
import { APP_NAME } from "@/constants";
import connectDB from "@/lib/mongodb";
import BookSuggestion from "@/models/BookSuggestion";

import { ReadBooksList } from "./ReadBooksList";

export const metadata = {
  title: `Lästa böcker - ${APP_NAME}`,
  description: "Se alla böcker som bokklubben har läst och diskuterat.",
};

// Force dynamic rendering for live updates
export const dynamic = "force-dynamic";

export default async function BooksRead() {
  await connectDB();

  // Fetch books marked as read
  const readBooks = await BookSuggestion.find({ status: "read" })
    .populate("suggestedBy", "name")
    .sort({ updatedAt: -1 })
    .lean();

  // Normalize the books into frontend-friendly objects
  const booksData = readBooks.map((book) => {
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
  });

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
          <p className="text-gray-600">Här kan du se vilka böcker bokklubben har läst.</p>

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

          {/* Books List */}
          <div
            className="flex w-full flex-col gap-6 px-4 sm:px-0"
            style={{
              fontFamily: "var(--font-body)",
              color: "var(--secondary-text)",
            }}
          >
            <ReadBooksList books={booksData} />
          </div>
        </div>
      </main>
    </div>
  );
}