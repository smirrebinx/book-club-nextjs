'use server';

import DOMPurify from 'isomorphic-dompurify';
import { Types } from 'mongoose';
import { revalidatePath } from 'next/cache';

import { requireAuth, requireApproved } from '@/lib/auth-helpers';
import connectDB from '@/lib/mongodb';
import {
  createSuggestionSchema,
  updateSuggestionSchema,
  voteSchema,
} from '@/lib/validations/suggestions';
import BookSuggestion from '@/models/BookSuggestion';

/**
 * Create a new book suggestion
 */
export async function createSuggestion(formData: FormData) {
  try {
    console.log('[createSuggestion] Starting...');
    const session = await requireApproved();
    console.log('[createSuggestion] Session approved, user:', session.user.id);

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
    console.log('[createSuggestion] Parsed form data');

    // Validate with Zod
    const validated = createSuggestionSchema.parse(data);
    console.log('[createSuggestion] Validated with Zod');

    // Sanitize inputs server-side with DOMPurify
    const sanitized = {
      title: DOMPurify.sanitize(validated.title, { ALLOWED_TAGS: [] }),
      author: DOMPurify.sanitize(validated.author, { ALLOWED_TAGS: [] }),
      description: DOMPurify.sanitize(validated.description, { ALLOWED_TAGS: [] }),
      isbn: validated.isbn,
      coverImage: validated.coverImage,
      googleBooksId: validated.googleBooksId,
      googleDescription: validated.googleDescription,
    };
    console.log('[createSuggestion] Sanitized inputs');

    console.log('[createSuggestion] Connecting to database...');
    await connectDB();
    console.log('[createSuggestion] Database connected');

    // Filter out undefined values to avoid Mongoose issues in serverless
    const dataToCreate = Object.fromEntries(
      Object.entries({
        ...sanitized,
        suggestedBy: session.user.id,
        votes: [],
        status: 'pending',
      }).filter(([_, value]) => value !== undefined)
    );
    console.log('[createSuggestion] Creating suggestion...');

    await BookSuggestion.create(dataToCreate);
    console.log('[createSuggestion] Suggestion created successfully');

    revalidatePath('/suggestions');
    return { success: true, message: 'Förslag skapat' };
  } catch (error) {
    console.error('[createSuggestion] ERROR:', error);
    console.error('[createSuggestion] Error stack:', error instanceof Error ? error.stack : 'No stack');
    console.error('[createSuggestion] Error details:', JSON.stringify(error, null, 2));
    if (error instanceof Error) {
      return { success: false, error: `${error.name}: ${error.message}` };
    }
    return { success: false, error: 'Kunde inte skapa förslag' };
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
      title: formData.get('title') as string | undefined,
      author: formData.get('author') as string | undefined,
      description: formData.get('description') as string | undefined,
    };

    // Remove undefined values
    const filtered = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined)
    );

    // Validate with Zod
    const validated = updateSuggestionSchema.parse(filtered);

    // Sanitize inputs
    const sanitized: Partial<{ title: string; author: string; description: string }> = {};
    if (validated.title) {
      sanitized.title = DOMPurify.sanitize(validated.title, { ALLOWED_TAGS: [] });
    }
    if (validated.author) {
      sanitized.author = DOMPurify.sanitize(validated.author, { ALLOWED_TAGS: [] });
    }
    if (validated.description) {
      sanitized.description = DOMPurify.sanitize(validated.description, { ALLOWED_TAGS: [] });
    }

    Object.assign(suggestion, sanitized);
    await suggestion.save();

    revalidatePath('/suggestions');
    return { success: true, message: 'Förslag uppdaterat' };
  } catch (error) {
    console.error('Error updating suggestion:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Kunde inte uppdatera förslag' };
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
    console.error('Error deleting suggestion:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Kunde inte ta bort förslag' };
  }
}

/**
 * Toggle vote on a suggestion
 */
export async function toggleVote(suggestionId: string) {
  try {
    console.log('[toggleVote] Starting for suggestion:', suggestionId);
    const session = await requireApproved();
    console.log('[toggleVote] Session approved, user:', session.user.id);

    // Validate input
    const validated = voteSchema.parse({ suggestionId });
    console.log('[toggleVote] Input validated');

    console.log('[toggleVote] Connecting to database...');
    await connectDB();
    console.log('[toggleVote] Database connected');

    console.log('[toggleVote] Finding suggestion...');
    const suggestion = await BookSuggestion.findById(validated.suggestionId);

    if (!suggestion) {
      console.error('[toggleVote] Suggestion not found:', validated.suggestionId);
      return { success: false, error: 'Förslag hittades inte' };
    }
    console.log('[toggleVote] Suggestion found, current votes:', suggestion.votes.length);

    // Check if user already voted
    const userVoteIndex = suggestion.votes.findIndex(
      (vote) => vote.toString() === session.user.id
    );
    console.log('[toggleVote] User vote index:', userVoteIndex);

    if (userVoteIndex > -1) {
      // Remove vote - create new array to ensure Mongoose detects the change
      console.log('[toggleVote] Removing vote');
      suggestion.votes = suggestion.votes.filter(
        (vote) => vote.toString() !== session.user.id
      );
    } else {
      // Add vote - create new array to ensure Mongoose detects the change
      console.log('[toggleVote] Adding vote');
      suggestion.votes = [...suggestion.votes, new Types.ObjectId(session.user.id)];
    }

    // Mark the votes field as modified to ensure Mongoose saves it
    suggestion.markModified('votes');
    console.log('[toggleVote] Saving suggestion with', suggestion.votes.length, 'votes...');
    await suggestion.save();
    console.log('[toggleVote] Suggestion saved successfully');

    revalidatePath('/suggestions');
    return {
      success: true,
      message: userVoteIndex > -1 ? 'Röst borttagen' : 'Röst tillagd',
      voteCount: suggestion.votes.length,
      hasVoted: userVoteIndex === -1,
    };
  } catch (error) {
    console.error('[toggleVote] ERROR:', error);
    console.error('[toggleVote] Error stack:', error instanceof Error ? error.stack : 'No stack');
    console.error('[toggleVote] Error details:', JSON.stringify(error, null, 2));
    if (error instanceof Error) {
      return { success: false, error: `${error.name}: ${error.message}` };
    }
    return { success: false, error: 'Kunde inte rösta' };
  }
}
