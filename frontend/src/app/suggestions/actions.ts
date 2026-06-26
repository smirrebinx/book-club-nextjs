'use server';

import { Types } from 'mongoose';
import { revalidatePath } from 'next/cache';

import { requireAdmin, requireAuth, requireApproved } from '@/lib/auth-helpers';
import { toSafeErrorMessage } from '@/lib/errors';
import { createContextLogger } from '@/lib/logger';
import connectDB from '@/lib/mongodb';
import { checkRateLimit } from '@/lib/rateLimit';
import { checkDuplicateSuggestion, formatStatus } from '@/lib/suggestions-helpers';
import {
  createSuggestionSchema,
  updateSuggestionSchema,
  voteSchema,
} from '@/lib/validations/suggestions';
import BookSuggestion from '@/models/BookSuggestion';

import type { SuggestionStatus } from '@/models/BookSuggestion';

const logger = createContextLogger('Suggestions');

/**
 * Simple sanitization function to remove dangerous HTML delimiter characters.
 * Replaces DOMPurify which doesn't work in Vercel serverless environments
 */
function sanitizeText(text: string): string {
  return text
    .replace(/[<>]/g, '') // Remove < and > characters
    .trim();
}

/**
 * Create a new book suggestion
 */
export async function createSuggestion(formData: FormData) {
  try {
    logger.debug('createSuggestion: starting');
    const session = await requireApproved();
    logger.debug('createSuggestion: session approved, user:', session.user.id);

    // Parse form data - convert null to undefined for optional fields
    const data = {
      title: formData.get('title') as string,
      author: formData.get('author') as string,
      description: formData.get('description') as string,
      isbn: formData.get('isbn') as string | null,
      coverImage: formData.get('coverImage') as string | null,
      googleBooksId: formData.get('googleBooksId') as string | null,
      googleDescription: formData.get('googleDescription') as string | null,
    };

    // Validate with Zod
    const validated = createSuggestionSchema.parse(data);

    // Sanitize inputs server-side
    const sanitized = {
      title: sanitizeText(validated.title),
      author: sanitizeText(validated.author),
      description: sanitizeText(validated.description),
      isbn: validated.isbn,
      coverImage: validated.coverImage,
      googleBooksId: validated.googleBooksId,
      googleDescription: validated.googleDescription,
    };

    await connectDB();

    // Check for duplicate suggestions
    const duplicateCheck = await checkDuplicateSuggestion(
      sanitized.title,
      sanitized.author,
      sanitized.isbn,
      sanitized.googleBooksId
    );

    if (duplicateCheck.isDuplicate && duplicateCheck.existingSuggestion) {
      const existing = duplicateCheck.existingSuggestion;
      logger.debug('createSuggestion: duplicate found:', existing.title, 'status:', existing.status);

      // Format error message based on status
      let errorMessage: string;
      if (existing.status === 'read') {
        // Book has already been read by the club
        const readDate = existing.createdAt
          ? new Date(existing.createdAt).toLocaleDateString('sv-SE')
          : '';
        errorMessage = `Den här boken har redan lästs av bokklubben${readDate ? ` (${readDate})` : ''}. Föreslå en annan bok!`;
      } else {
        // Book is pending, approved, or currently_reading
        const statusText = formatStatus(existing.status);
        errorMessage = `Den här boken har redan föreslagits av ${existing.suggestedBy.name} och har status: ${statusText}`;
      }

      return {
        success: false,
        error: errorMessage
      };
    }

    // Filter out undefined values to avoid Mongoose issues in serverless
    const dataToCreate = Object.fromEntries(
      Object.entries({
        ...sanitized,
        suggestedBy: session.user.id,
        votes: [],
        status: 'pending',
      }).filter(([_, value]) => value !== undefined)
    );

    await BookSuggestion.create(dataToCreate);
    logger.debug('createSuggestion: suggestion created successfully');

    revalidatePath('/suggestions');
    return { success: true, message: 'Förslag skapat' };
  } catch (error) {
    return { success: false, error: toSafeErrorMessage(error, 'Kunde inte skapa förslag') };
  }
}

/**
 * Update a book suggestion (only owner or admin)
 */
export async function updateSuggestion(suggestionId: string, formData: FormData) {
  try {
    const session = await requireAuth();

    await connectDB();
    const suggestion = await BookSuggestion.findById(suggestionId);

    if (!suggestion) {
      return { success: false, error: 'Förslag hittades inte' };
    }

    // Check ownership or admin
    const isOwner = suggestion.suggestedBy.toString() === session.user.id;
    const isAdmin = session.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return { success: false, error: 'Du har inte behörighet att redigera detta förslag' };
    }

    // Parse form data
    const data = {
      title: formData.get('title') as string | null,
      author: formData.get('author') as string | null,
      description: formData.get('description') as string | null,
    };

    // Remove null and undefined values
    const filtered = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined && value !== null)
    );

    // Validate with Zod
    const validated = updateSuggestionSchema.parse(filtered);

    // Sanitize inputs
    const sanitized: Partial<{ title: string; author: string; description: string }> = {};
    if (validated.title) {
      sanitized.title = sanitizeText(validated.title);
    }
    if (validated.author) {
      sanitized.author = sanitizeText(validated.author);
    }
    if (validated.description) {
      sanitized.description = sanitizeText(validated.description);
    }

    Object.assign(suggestion, sanitized);
    await suggestion.save();

    revalidatePath('/suggestions');
    return { success: true, message: 'Förslag uppdaterat' };
  } catch (error) {
    return { success: false, error: toSafeErrorMessage(error, 'Kunde inte uppdatera förslag') };
  }
}

/**
 * Delete a book suggestion (only owner or admin)
 */
export async function deleteSuggestion(suggestionId: string) {
  try {
    const session = await requireAuth();

    await connectDB();
    const suggestion = await BookSuggestion.findById(suggestionId);

    if (!suggestion) {
      return { success: false, error: 'Förslag hittades inte' };
    }

    // Check ownership or admin
    const isOwner = suggestion.suggestedBy.toString() === session.user.id;
    const isAdmin = session.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return { success: false, error: 'Du har inte behörighet att ta bort detta förslag' };
    }

    await suggestion.deleteOne();

    revalidatePath('/suggestions');
    return { success: true, message: 'Förslag borttaget' };
  } catch (error) {
    return { success: false, error: toSafeErrorMessage(error, 'Kunde inte ta bort förslag') };
  }
}

/**
 * Toggle vote on a suggestion
 */
export async function toggleVote(suggestionId: string) {
  try {
    logger.debug('Starting vote toggle for suggestion:', suggestionId);
    const session = await requireApproved();

    // Rate limiting: 10 votes per minute per user
    const rateLimit = checkRateLimit(`vote:${session.user.id}`, {
      limit: 10,
      windowMs: 60000 // 1 minute
    });

    if (!rateLimit.success) {
      logger.warn('Rate limit exceeded for user:', session.user.id);
      return {
        success: false,
        error: 'För många röstningsförsök. Vänligen vänta en minut.'
      };
    }

    // Validate input
    const validated = voteSchema.parse({ suggestionId });
    logger.debug('Input validated');

    logger.debug('Connecting to database...');
    await connectDB();

    // Check if voting is locked (if there's an approved or currently_reading book)
    const winnerBook = await BookSuggestion.findOne({
      status: { $in: ['approved', 'currently_reading'] }
    });

    if (winnerBook) {
      logger.debug('Voting is locked - winner book exists');
      return {
        success: false,
        error: 'Röstning är låst. En vinnare har redan valts. Vänta tills administratören startar en ny omgång.'
      };
    }

    const suggestion = await BookSuggestion.findById(validated.suggestionId);

    if (!suggestion) {
      logger.error('Suggestion not found:', validated.suggestionId);
      return { success: false, error: 'Förslag hittades inte' };
    }

    // Check if user already voted
    const userVoteIndex = suggestion.votes.findIndex(
      (vote) => vote.toString() === session.user.id
    );

    if (userVoteIndex > -1) {
      // Remove vote - create new array to ensure Mongoose detects the change
      logger.debug('toggleVote: removing vote');
      suggestion.votes = suggestion.votes.filter(
        (vote) => vote.toString() !== session.user.id
      );
    } else {
      // Add vote - create new array to ensure Mongoose detects the change
      logger.debug('toggleVote: adding vote');
      suggestion.votes = [...suggestion.votes, new Types.ObjectId(session.user.id)];
    }

    // Mark the votes field as modified to ensure Mongoose saves it
    suggestion.markModified('votes');
    await suggestion.save();

    revalidatePath('/suggestions');
    return {
      success: true,
      message: userVoteIndex > -1 ? 'Röst borttagen' : 'Röst tillagd',
      voteCount: suggestion.votes.length,
      hasVoted: userVoteIndex === -1,
    };
  } catch (error) {
    return { success: false, error: toSafeErrorMessage(error, 'Kunde inte rösta') };
  }
}

/**
 * Update suggestion status (admin only)
 */
export async function updateSuggestionStatus(suggestionId: string, newStatus: string) {
  try {
    await requireAdmin();

    await connectDB();
    const suggestion = await BookSuggestion.findById(suggestionId);

    if (!suggestion) {
      return { success: false, error: 'Förslag hittades inte' };
    }

    // Validate status
    const validStatuses = ['pending', 'approved', 'currently_reading', 'rejected', 'read'];
    if (!validStatuses.includes(newStatus)) {
      return { success: false, error: 'Ogiltig status' };
    }

    suggestion.status = newStatus as SuggestionStatus;
    await suggestion.save();

    revalidatePath('/suggestions');
    return { success: true, message: 'Status uppdaterad' };
  } catch (error) {
    return { success: false, error: toSafeErrorMessage(error, 'Kunde inte uppdatera status') };
  }
}
