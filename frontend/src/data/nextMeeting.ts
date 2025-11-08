import type { MeetingData } from "@/types/meeting";

// Re-export the type so other files can import it from here
export type { MeetingData };

export const nextMeetingData: MeetingData = {
  id: "meeting-2025-11-11",
  date: "Tisdag 11 november 2025",
  time: "17:00",
  location: "Hos Ida",
  book: {
    id: "book-alla-fyra-2025",
    title: "Alla fyra",
    author: "Miranda July",
  },
  additionalInfo:
    "Vi börjar med mat och sedan diskuterar vi boken.",
};
