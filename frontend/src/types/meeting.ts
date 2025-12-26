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
  // New fields for 3-winner voting system (additive, backward compatible)
  votingRound?: string; // Reference to VotingRound that assigned this book
  placement?: 1 | 2 | 3; // Which winner (1st, 2nd, or 3rd place) - TODO-SCALABILITY: Hardcoded to 3
  autoAssigned?: boolean; // Was this auto-assigned vs manually set by admin?
  assignedAt?: Date; // When book was assigned to this meeting
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
  // New fields for 3-winner voting system (additive, backward compatible)
  votingRound?: string; // Reference to VotingRound that assigned this book
  placement?: 1 | 2 | 3; // Which winner (1st, 2nd, or 3rd place) - TODO-SCALABILITY: Hardcoded to 3
  autoAssigned?: boolean; // Was this auto-assigned vs manually set by admin?
  assignedAt?: string; // When book was assigned to this meeting (ISO string)
  createdAt?: string;
  updatedAt?: string;
}
