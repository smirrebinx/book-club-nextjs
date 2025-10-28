export interface BookInfo {
  id: string;
  title: string;
  author: string;
  coverImage?: string; // Optional: URL to book cover image
  isbn?: string; // Optional: For future integrations
}

export interface MeetingData {
  id: string; // Unique identifier for the meeting
  date: string;
  time: string;
  location: string;
  book: BookInfo;
  additionalInfo: string;
}

export const nextMeetingData: MeetingData = {
  id: "meeting-2025-11-11",
  date: "Tisdag 11 november 2025",
  time: "17:00",
  location: "Hos Ida i Lund",
  book: {
    id: "book-alla-fyra-2025",
    title: "Alla fyra",
    author: "Miranda July",
  },
  additionalInfo:
    "Vi börjar med mat och sedan diskuterar vi boken. Glöm inte att läsa boken före träffen!",
};
