import Link from "next/link";

import type { MeetingData } from "@/data/nextMeeting";

interface NextMeetingCardProps {
  meetingData: MeetingData;
}

export default function NextMeetingCard({ meetingData }: NextMeetingCardProps) {
  return (
    <Link
      href="/NextMeeting"
      className="group block w-full max-w-md rounded-lg border p-6 transition-all duration-200 hover:shadow-lg focus:outline-2 focus:outline-offset-2"
      style={{
        borderColor: "var(--primary-border)",
        backgroundColor: "var(--background)",
        outlineColor: "var(--focus-ring)",
      }}
      aria-label="Visa information om nästa bokträff"
    >
      <article className="flex flex-col gap-4">
        {/* Card Title */}
        <h2
          className="text-2xl font-bold tracking-wide"
          style={{
            fontFamily: "var(--font-heading)",
            color: "var(--primary-text)",
          }}
        >
          Nästa bokträff
        </h2>

        {/* Meeting Summary */}
        <div
          className="flex flex-col gap-2 text-base"
          style={{
            fontFamily: "var(--font-body)",
            color: "var(--secondary-text)",
          }}
        >
          {/* Date */}
          <div className="flex flex-col gap-1">
            <span className="font-semibold" style={{ color: "var(--primary-text)" }}>
              Datum och tid
            </span>
            <span>{meetingData.date}, klockan {meetingData.time}</span>
          </div>

          {/* Location */}
          <div className="flex flex-col gap-1">
            <span className="font-semibold" style={{ color: "var(--primary-text)" }}>
              Plats
            </span>
            <span>{meetingData.location}</span>
          </div>

          {/* Book */}
          <div className="flex flex-col gap-1">
            <span className="font-semibold" style={{ color: "var(--primary-text)" }}>
              Bok
            </span>
            <span>{meetingData.book.title} av {meetingData.book.author}</span>
          </div>
        </div>

        {/* Call to Action */}
        <div className="flex items-center gap-2 pt-2">
          <span
            className="text-sm font-medium transition-colors duration-200 group-hover:underline"
            style={{
              fontFamily: "var(--font-body)",
              color: "var(--secondary-text)",
            }}
          >
            Gå till sidan Nästa bokträff
          </span>
          <svg
            className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            style={{ color: "var(--secondary-text)" }}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
            />
          </svg>
        </div>
      </article>
    </Link>
  );
}
