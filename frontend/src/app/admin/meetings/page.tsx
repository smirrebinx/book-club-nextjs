import connectDB from '@/lib/mongodb';
import Meeting from '@/models/Meeting';

import { AdminMeetingsTable } from './AdminMeetingsTable';

// Force dynamic rendering - don't pre-render at build time
export const dynamic = 'force-dynamic';

export default async function AdminMeetingsPage() {
  await connectDB();

  // Fetch all meetings from database
  const meetings = await Meeting.find({}).sort({ date: 1 }).lean();

  // Format for client component
  const meetingsData = meetings.map((m) => ({
    _id: m._id.toString(),
    id: m.id,
    date: m.date,
    time: m.time,
    location: m.location,
    book: {
      id: m.book.id,
      title: m.book.title,
      author: m.book.author,
      coverImage: m.book.coverImage,
      isbn: m.book.isbn,
    },
    additionalInfo: m.additionalInfo,
    createdAt: m.createdAt?.toISOString(),
    updatedAt: m.updatedAt?.toISOString(),
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Möteshantering</h1>
        <p className="text-sm md:text-base text-gray-600 mt-2">
          Skapa, redigera och ta bort möten
        </p>
      </div>

      <AdminMeetingsTable meetings={meetingsData} />
    </div>
  );
}
