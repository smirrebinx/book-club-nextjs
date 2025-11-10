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
  createdAt?: Date;
  updatedAt?: Date;
}

// Meeting with MongoDB _id for client components
export interface Meeting extends MeetingData {
  _id: string;
  createdAt?: string;
  updatedAt?: string;
}
