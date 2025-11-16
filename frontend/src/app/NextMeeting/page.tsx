import { APP_NAME } from "@/constants";
import connectDB from "@/lib/mongodb";
import Meeting from "@/models/Meeting";

import StaticCalendar from "./StaticCalendar";

import type { MeetingData } from "@/types/meeting";

// Force dynamic rendering - don't pre-render at build time
export const dynamic = 'force-dynamic';

export const metadata = {
  title: `Bokträffar - ${APP_NAME}`,
  description: "Information om nästa bokträff: datum, tid, plats och vilken bok vi ska läsa.",
};

async function getUpcomingMeetings(): Promise<MeetingData[]> {
  try {
    await connectDB();

    // Get all meetings
    const allMeetings = await Meeting.find({}).lean();

    // Get today's date at midnight for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Filter and sort future meetings
    const futureMeetings = allMeetings
      .filter(m => {
        if (!m.date) return false;
        const meetingDate = new Date(m.date);
        return meetingDate >= today;
      })
      .sort((a, b) => {
        if (!a.date || !b.date) return 0;
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateA - dateB;
      });

    // Convert to plain objects
    return futureMeetings.map(meeting => ({
      id: meeting.id,
      date: meeting.date,
      time: meeting.time,
      location: meeting.location,
      book: meeting.book,
      additionalInfo: meeting.additionalInfo,
    } as MeetingData));
  } catch (error) {
    console.error('Error fetching upcoming meetings:', error);
    return [];
  }
}

export default async function NextMeeting() {
  const upcomingMeetings = await getUpcomingMeetings();

  if (upcomingMeetings.length === 0) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{
          backgroundColor: "var(--background)",
          color: "var(--secondary-text)",
        }}
      >
        <main className="flex w-full max-w-3xl flex-col items-center gap-8 px-4 py-8">
          <p className="text-lg">Inga kommande bokträffar planerade.</p>
        </main>
      </div>
    );
  }

  // Get the next (soonest) meeting
  const nextMeeting = upcomingMeetings[0];
  const futureMeetings = upcomingMeetings.slice(1);
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
          <div className="flex w-full justify-center sm:justify-start">
            <StaticCalendar />
          </div>

          {/* Heading */}
          <h1
            className="px-4 text-3xl leading-10 tracking-wide sm:px-0"
            style={{
              fontFamily: "var(--font-heading)",
              color: "var(--primary-text)",
            }}
          >
            Bokträffar
          </h1>

        {/* Next Meeting Details */}
        <div className="w-full px-4 sm:px-0">
          <h2
            className="text-2xl font-semibold mb-4"
            style={{
              fontFamily: "var(--font-heading)",
              color: "var(--primary-text)",
            }}
          >
            Nästa bokträff
          </h2>
          <div
            className="flex w-full flex-col gap-6"
            style={{
              fontFamily: "var(--font-body)",
              color: "var(--secondary-text)",
            }}
          >
            {/* Date & Time Section */}
            <section className="flex flex-col gap-2">
              <h3
                className="text-xl font-semibold"
                style={{ color: "var(--primary-text)" }}
              >
                Datum och tid
              </h3>
              <p className="text-lg leading-7">
                {nextMeeting.date}, klockan {nextMeeting.time}
              </p>
            </section>

            {/* Location Section */}
            <section className="flex flex-col gap-2">
              <h3
                className="text-xl font-semibold"
                style={{ color: "var(--primary-text)" }}
              >
                Plats
              </h3>
              <p className="text-lg leading-7">
                {nextMeeting.location}
              </p>
            </section>

            {/* Book Section */}
            <section className="flex flex-col gap-2">
              <h3
                className="text-xl font-semibold"
                style={{ color: "var(--primary-text)" }}
              >
                Bok
              </h3>
              <div className="flex flex-col gap-1">
                <p className="text-lg leading-7">
                  <span className="font-semibold">Titel:</span> {nextMeeting.book?.title || 'Ingen bok vald'}
                </p>
                <p className="text-lg leading-7">
                  <span className="font-semibold">Författare:</span> {nextMeeting.book?.author || '-'}
                </p>
              </div>
            </section>

            {/* Additional Info Section */}
            {nextMeeting.additionalInfo && (
              <section className="flex flex-col gap-2">
                <h3
                  className="text-xl font-semibold"
                  style={{ color: "var(--primary-text)" }}
                >
                  Övrigt
                </h3>
                <p className="text-lg leading-7">
                  {nextMeeting.additionalInfo}
                </p>
              </section>
            )}
          </div>
        </div>

        {/* Future Meetings */}
        {futureMeetings.length > 0 && (
          <div className="w-full px-4 sm:px-0 mt-8">
            <h2
              className="text-2xl font-semibold mb-4"
              style={{
                fontFamily: "var(--font-heading)",
                color: "var(--primary-text)",
              }}
            >
              Kommande bokträffar
            </h2>
            <div className="space-y-6">
              {futureMeetings.map((meeting, index) => (
                <div
                  key={meeting.id || index}
                  className="border-l-4 pl-4 py-2"
                  style={{
                    borderColor: "var(--primary-border)",
                    fontFamily: "var(--font-body)",
                    color: "var(--secondary-text)",
                  }}
                >
                  <p className="text-lg font-semibold" style={{ color: "var(--primary-text)" }}>
                    {meeting.date}, klockan {meeting.time}
                  </p>
                  <p className="text-base mt-1">
                    <span className="font-semibold">Plats:</span> {meeting.location}
                  </p>
                  {meeting.book && (
                    <p className="text-base mt-1">
                      <span className="font-semibold">Bok:</span> {meeting.book.title} av {meeting.book.author}
                    </p>
                  )}
                  {meeting.additionalInfo && (
                    <p className="text-sm mt-2 text-gray-600">
                      {meeting.additionalInfo}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        </div>
      </main>
    </div>
  );
}
