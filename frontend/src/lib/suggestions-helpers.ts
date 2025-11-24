import connectDB from './mongodb';
import BookSuggestion from '@/models/BookSuggestion';

import type { SuggestionStatus } from '@/models/BookSuggestion';

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  existingSuggestion?: {
    _id: string;
    title: string;
    author: string;
    status: SuggestionStatus;
    suggestedBy: {
      name: string;
    };
    createdAt?: Date;
  };
  matchType?: 'isbn' | 'googleBooksId' | 'title-author';
}

/**
 * Helper function to escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Check if a book suggestion is a duplicate
 * Checks against active statuses: pending, approved, currently_reading, and read
 * Only rejected books can be re-suggested
 *
 * Priority:
 * 1. ISBN match (most reliable)
 * 2. Google Books ID match
 * 3. Title + Author match (case-insensitive)
 */
export async function checkDuplicateSuggestion(
  title: string,
  author: string,
  isbn?: string,
  googleBooksId?: string
): Promise<DuplicateCheckResult> {
  try {
    await connectDB();

    // Build OR conditions for the query
    const orConditions: Array<Record<string, unknown>> = [];

    // Check ISBN if provided (highest priority)
    if (isbn && isbn.trim()) {
      orConditions.push({ isbn: isbn.trim() });
    }

    // Check Google Books ID if provided
    if (googleBooksId && googleBooksId.trim()) {
      orConditions.push({ googleBooksId: googleBooksId.trim() });
    }

    // Always check title + author combination (case-insensitive)
    const escapedTitle = escapeRegex(title.trim());
    const escapedAuthor = escapeRegex(author.trim());
    orConditions.push({
      title: { $regex: new RegExp(`^${escapedTitle}$`, 'i') },
      author: { $regex: new RegExp(`^${escapedAuthor}$`, 'i') }
    });

    // Query for duplicates - check all statuses except rejected
    const existingSuggestion = await BookSuggestion.findOne({
      status: { $in: ['pending', 'approved', 'currently_reading', 'read'] },
      $or: orConditions
    })
      .populate('suggestedBy', 'name')
      .sort({ createdAt: -1 }) // Get the most recent match
      .lean();

    if (!existingSuggestion) {
      return { isDuplicate: false };
    }

    // Determine match type for logging/debugging
    let matchType: 'isbn' | 'googleBooksId' | 'title-author' = 'title-author';

    if (isbn && existingSuggestion.isbn === isbn.trim()) {
      matchType = 'isbn';
    } else if (googleBooksId && existingSuggestion.googleBooksId === googleBooksId.trim()) {
      matchType = 'googleBooksId';
    }

    return {
      isDuplicate: true,
      existingSuggestion: {
        _id: existingSuggestion._id.toString(),
        title: existingSuggestion.title,
        author: existingSuggestion.author,
        status: existingSuggestion.status,
        suggestedBy: {
          name: (existingSuggestion.suggestedBy as { name: string })?.name || 'Okänd'
        },
        createdAt: existingSuggestion.createdAt
      },
      matchType
    };
  } catch (error) {
    console.error('[checkDuplicateSuggestion] Error:', error);
    // On error, allow the suggestion to proceed (fail open)
    // The actual creation will handle database errors
    return { isDuplicate: false };
  }
}

/**
 * Format status in Swedish for user-facing messages
 */
export function formatStatus(status: SuggestionStatus): string {
  const statusMap: Record<SuggestionStatus, string> = {
    pending: 'inväntar röst',
    approved: 'godkänd',
    currently_reading: 'läses nu',
    rejected: 'avvisad',
    read: 'läst'
  };
  return statusMap[status] || status;
}
