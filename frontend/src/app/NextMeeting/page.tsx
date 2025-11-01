import LottieAnimation from "@/components/LottieAnimation";
import { APP_NAME } from "@/constants";

import type { MeetingData } from "@/types/meeting";

export const metadata = {
  title: `Nästa bokträff - ${APP_NAME}`,
  description: "Information om nästa bokträff: datum, tid, plats och vilken bok vi ska läsa.",
};

async function getNextMeeting(): Promise<MeetingData | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/meetings/next`, {
      cache: 'no-store', // Always fetch fresh data
    });

    if (!res.ok) {
      console.error('Failed to fetch next meeting');
      return null;
    }

    const data = await res.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Error fetching next meeting:', error);
    return null;
  }
}

export default async function NextMeeting() {
  const meetingData = await getNextMeeting();

  if (!meetingData) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{
          backgroundColor: "var(--background)",
          color: "var(--secondary-text)",
        }}
      >
        <main className="flex w-full max-w-3xl flex-col items-center gap-8 px-4 py-8">
          <p className="text-lg">Ingen bokträff hittades. Kontrollera att databasen är konfigurerad korrekt.</p>
        </main>
      </div>
    );
  }
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
            <LottieAnimation
              src="/animations/Calendar.lottie"
              width={200}
              height={200}
              ariaLabel="Animerad kalender"
              isDecorative={false}
            />
          </div>

          {/* Heading */}
          <h1
            className="px-4 text-3xl leading-10 tracking-wide sm:px-0"
            style={{
              fontFamily: "var(--font-heading)",
              color: "var(--primary-text)",
            }}
          >
            Nästa bokträff
          </h1>

        {/* Meeting Details */}
        <div
          className="flex w-full flex-col gap-6 px-4 sm:px-0"
          style={{
            fontFamily: "var(--font-body)",
            color: "var(--secondary-text)",
          }}
        >
          {/* Date & Time Section */}
          <section className="flex flex-col gap-2">
            <h2
              className="text-xl font-semibold"
              style={{ color: "var(--primary-text)" }}
            >
              Datum och tid
            </h2>
            <p className="text-lg leading-7">
              {meetingData.date}, klockan {meetingData.time}
            </p>
          </section>

          {/* Location Section */}
          <section className="flex flex-col gap-2">
            <h2
              className="text-xl font-semibold"
              style={{ color: "var(--primary-text)" }}
            >
              Plats
            </h2>
            <p className="text-lg leading-7">
              {meetingData.location}
            </p>
          </section>

          {/* Book Section */}
          <section className="flex flex-col gap-2">
            <h2
              className="text-xl font-semibold"
              style={{ color: "var(--primary-text)" }}
            >
              Bok
            </h2>
            <div className="flex flex-col gap-1">
              <p className="text-lg leading-7">
                <span className="font-semibold">Titel:</span> {meetingData.book.title}
              </p>
              <p className="text-lg leading-7">
                <span className="font-semibold">Författare:</span> {meetingData.book.author}
              </p>
            </div>
          </section>

          {/* Additional Info Section */}
          <section className="flex flex-col gap-2">
            <h2
              className="text-xl font-semibold"
              style={{ color: "var(--primary-text)" }}
            >
              Övrigt
            </h2>
            <p className="text-lg leading-7">
              {meetingData.additionalInfo}
            </p>
          </section>
        </div>
        </div>
      </main>
    </div>
  );
}
