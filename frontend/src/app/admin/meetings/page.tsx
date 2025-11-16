import connectDB from '@/lib/mongodb';
import BookSuggestion from '@/models/BookSuggestion';
import Meeting from '@/models/Meeting';

import { AdminMeetingsTable } from './AdminMeetingsTable';

import type { BookInfo } from '@/types/meeting';

// Force dynamic rendering - don't pre-render at build time
export const dynamic = 'force-dynamic';

interface LeanMeeting {
  _id: { toString: () => string };
  id?: string;
  date?: string;
  time?: string;
  location?: string;
  book?: {
    id?: string;
    title?: string;
    author?: string;
    coverImage?: string;
    isbn?: string;
  };
  additionalInfo?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

function formatBookData(book?: LeanMeeting['book']) {
  if (!book) return undefined;
  return {
    id: book.id || '',
    title: book.title || '',
    author: book.author || '',
    coverImage: book.coverImage || '',
    isbn: book.isbn || '',
  };
}

function formatMeetingData(m: LeanMeeting) {
  return {
    _id: m._id.toString(),
    id: m.id || '',
    date: m.date || '',
    time: m.time || '',
    location: m.location || '',
    book: formatBookData(m.book),
    additionalInfo: m.additionalInfo || '',
    createdAt: m.createdAt?.toISOString() || '',
    updatedAt: m.updatedAt?.toISOString() || '',
  };
}

export default async function AdminMeetingsPage() {
  try {
    await connectDB();

    // Fetch all meetings from database
    const meetings = await Meeting.find({}).sort({ date: 1 }).lean().exec();

    // Format for client component - use JSON serialization to ensure clean data
    const meetingsData = JSON.parse(JSON.stringify(meetings.map(formatMeetingData)));

    // Fetch the book currently being read
    const currentlyReadingBook = await BookSuggestion.findOne({
      status: 'currently_reading'
    })
      .select('_id title author coverImage isbn')
      .lean()
      .exec();

    // Create a plain serializable object for the current book
    const currentBook: BookInfo | undefined = currentlyReadingBook
      ? JSON.parse(JSON.stringify({
          id: String(currentlyReadingBook._id),
          title: String(currentlyReadingBook.title),
          author: String(currentlyReadingBook.author),
          coverImage: currentlyReadingBook.coverImage || undefined,
          isbn: currentlyReadingBook.isbn || undefined,
        }))
      : undefined;

    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Möteshantering</h1>
          <p className="text-sm md:text-base text-gray-600 mt-2">
            Skapa, redigera och ta bort möten
          </p>
        </div>

        <AdminMeetingsTable meetings={meetingsData} currentBook={currentBook} />
      </div>
    );
  } catch (error) {
    console.error('Error loading meetings page:', error);
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Möteshantering</h1>
          <p className="text-sm md:text-base text-red-600 mt-2">
            Ett fel uppstod vid laddning av möten. Se konsollen för mer information.
          </p>
        </div>
      </div>
    );
  }
}
