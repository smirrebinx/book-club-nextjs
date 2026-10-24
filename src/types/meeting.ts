export interface BookInfo {
  id?: string;
  title?: string;
  author?: string;
  coverImage?: string; // Optional: URL to book cover image
  isbn?: string; // Optional: For future integrations
  googleDescription?: string; // Google Books API description
}

export interface MeetingData {
  id?: string; // Unique identifier for the meeting
  date?: string;
  time?: string;
  location?: string;
  book?: BookInfo;
  additionalInfo?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Meeting with MongoDB _id for client components (dates as strings for JSON serialization)
export interface Meeting {
  _id: string;
  id?: string;
  date?: string;
  time?: string;
  location?: string;
  book?: BookInfo;
  additionalInfo?: string;
  createdAt?: string;
  updatedAt?: string;
}
