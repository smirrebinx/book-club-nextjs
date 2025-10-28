import { APP_NAME } from "@/constants";
import { nextMeetingData } from "@/data/nextMeeting";

export const metadata = {
  title: `Nästa bokträff - ${APP_NAME}`,
  description: "Information om nästa bokträff: datum, tid, plats och vilken bok vi ska läsa.",
};

export default function NextMeeting() {
  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--secondary-text)",
      }}
    >
      <main
        className="flex w-full max-w-3xl flex-col items-start gap-8 px-4 py-8 sm:px-16 sm:py-32"
        style={{ backgroundColor: "var(--background)" }}
      >
        {/* Heading */}
        <h1
          className="px-4 text-3xl leading-10 tracking-wide sm:px-0"
          style={{
            fontFamily: "var(--font-newyorker)",
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
              {nextMeetingData.date}, klockan {nextMeetingData.time}
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
              {nextMeetingData.location}
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
                <span className="font-semibold">Titel:</span> {nextMeetingData.book.title}
              </p>
              <p className="text-lg leading-7">
                <span className="font-semibold">Författare:</span> {nextMeetingData.book.author}
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
              {nextMeetingData.additionalInfo}
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
