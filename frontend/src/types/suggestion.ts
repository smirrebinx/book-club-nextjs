import type { SuggestionStatus } from '@/models/BookSuggestion';

export interface SuggestionWithVotes {
  _id: string;
  title: string;
  author: string;
  description: string;
  status: SuggestionStatus;
  votes: string[];
  voteCount: number;
  hasVoted: boolean;
  suggestedBy: {
    _id?: string;
    name: string;
    email?: string;
  };
  createdAt: string;
  updatedAt?: string;
  coverImage?: string;
  isbn?: string;
  googleDescription?: string;
}

export interface SuggestionFormData {
  title: string;
  author: string;
  description: string;
}
