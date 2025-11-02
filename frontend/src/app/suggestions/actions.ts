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
    const session = await requireApproved();

    // Parse form data
    const data = {
      title: formData.get('title') as string,
      author: formData.get('author') as string,
      description: formData.get('description') as string,
    };

    // Validate with Zod
    const validated = createSuggestionSchema.parse(data);

    // Sanitize inputs server-side with DOMPurify
    const sanitized = {
      title: DOMPurify.sanitize(validated.title, { ALLOWED_TAGS: [] }),
      author: DOMPurify.sanitize(validated.author, { ALLOWED_TAGS: [] }),
      description: DOMPurify.sanitize(validated.description, { ALLOWED_TAGS: [] }),
    };

    await connectDB();

    const suggestion = await BookSuggestion.create({
      ...sanitized,
      suggestedBy: session.user.id,
      votes: [],
      status: 'pending',
    });

    revalidatePath('/suggestions');
    return { success: true, message: 'Förslag skapat', data: suggestion };
  } catch (error) {
    console.error('Error creating suggestion:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
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
    const session = await requireApproved();

    // Validate input
    const validated = voteSchema.parse({ suggestionId });

    await connectDB();
    const suggestion = await BookSuggestion.findById(validated.suggestionId);

    if (!suggestion) {
      return { success: false, error: 'Förslag hittades inte' };
    }

    // Check if user already voted
    const userVoteIndex = suggestion.votes.findIndex(
      (vote) => vote.toString() === session.user.id
    );

    if (userVoteIndex > -1) {
      // Remove vote
      suggestion.votes.splice(userVoteIndex, 1);
    } else {
      // Add vote
      suggestion.votes.push(new Types.ObjectId(session.user.id));
    }

    await suggestion.save();

    revalidatePath('/suggestions');
    return {
      success: true,
      message: userVoteIndex > -1 ? 'Röst borttagen' : 'Röst tillagd',
      voteCount: suggestion.votes.length,
      hasVoted: userVoteIndex === -1,
    };
  } catch (error) {
    console.error('Error toggling vote:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Kunde inte rösta' };
  }
}
