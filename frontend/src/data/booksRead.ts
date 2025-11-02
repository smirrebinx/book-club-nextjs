import type { BookInfo } from "@/types/meeting";

export interface ReadBook extends BookInfo {
  meetingDate: string; // When the book was discussed
  meetingLocation: string; // Where it was discussed
  meetingId: string; // Reference to the meeting
}

// Example structure - you'll populate this when implementing BooksRead page
export const booksRead: ReadBook[] = [
  // When you're ready to move a book from nextMeeting to here,
  // you can extract the book info and add meeting details:
  // {
  //   ...nextMeetingData.book,
  //   meetingDate: nextMeetingData.date,
  //   meetingLocation: nextMeetingData.location,
  //   meetingId: nextMeetingData.id,
  // }
];
