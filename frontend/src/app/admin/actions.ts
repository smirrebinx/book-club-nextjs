'use server';

import { revalidatePath } from 'next/cache';

import { requireAdmin } from '@/lib/auth-helpers';
import connectDB from '@/lib/mongodb';
import {
  approveUserSchema,
  changeRoleSchema,
  updateSuggestionStatusSchema,
} from '@/lib/validations/admin';
import BookSuggestion from '@/models/BookSuggestion';
import User from '@/models/User';

import type { SuggestionStatus } from '@/models/BookSuggestion';
import type { UserRole } from '@/models/User';

/**
 * Approve a pending user
 */
export async function approveUser(userId: string) {
  try {
    await requireAdmin();

    // Validate input
    const validated = approveUserSchema.parse({ userId });

    await connectDB();
    const user = await User.findById(validated.userId);

    if (!user) {
      return { success: false, error: 'Användare hittades inte' };
    }

    user.isApproved = true;
    // If user is pending, promote to 'user' role
    if (user.role === 'pending') {
      user.role = 'user';
    }

    await user.save();

    revalidatePath('/admin/users');
    return { success: true, message: 'Användare godkänd' };
  } catch (error) {
    console.error('Error approving user:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Kunde inte godkänna användare' };
  }
}

/**
 * Reject a user (set isApproved to false)
 */
export async function rejectUser(userId: string) {
  try {
    await requireAdmin();

    // Validate input
    const validated = approveUserSchema.parse({ userId });

    await connectDB();
    const user = await User.findById(validated.userId);

    if (!user) {
      return { success: false, error: 'Användare hittades inte' };
    }

    // Prevent rejecting admins
    if (user.role === 'admin') {
      return { success: false, error: 'Kan inte avvisa en administratör' };
    }

    user.isApproved = false;
    user.role = 'pending';

    await user.save();

    revalidatePath('/admin/users');
    return { success: true, message: 'Användare avvisad' };
  } catch (error) {
    console.error('Error rejecting user:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Kunde inte avvisa användare' };
  }
}

/**
 * Change user role
 */
export async function changeUserRole(userId: string, role: UserRole) {
  try {
    await requireAdmin();

    // Validate input
    const validated = changeRoleSchema.parse({ userId, role });

    await connectDB();
    const user = await User.findById(validated.userId);

    if (!user) {
      return { success: false, error: 'Användare hittades inte' };
    }

    user.role = validated.role;

    // If promoting to user or admin, also approve them
    if (validated.role === 'user' || validated.role === 'admin') {
      user.isApproved = true;
    }

    await user.save();

    revalidatePath('/admin/users');
    return { success: true, message: 'Användarroll uppdaterad' };
  } catch (error) {
    console.error('Error changing user role:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Kunde inte ändra användarroll' };
  }
}

/**
 * Update suggestion status (admin only)
 */
export async function updateSuggestionStatus(
  suggestionId: string,
  status: SuggestionStatus
) {
  try {
    await requireAdmin();

    // Validate input
    const validated = updateSuggestionStatusSchema.parse({ suggestionId, status });

    await connectDB();
    const suggestion = await BookSuggestion.findById(validated.suggestionId);

    if (!suggestion) {
      return { success: false, error: 'Förslag hittades inte' };
    }

    suggestion.status = validated.status;
    await suggestion.save();

    revalidatePath('/admin/suggestions');
    revalidatePath('/suggestions');
    return { success: true, message: 'Status uppdaterad' };
  } catch (error) {
    console.error('Error updating suggestion status:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Kunde inte uppdatera status' };
  }
}

/**
 * Delete suggestion (admin only)
 */
export async function deleteSuggestionAsAdmin(suggestionId: string) {
  try {
    await requireAdmin();

    await connectDB();
    const suggestion = await BookSuggestion.findById(suggestionId);

    if (!suggestion) {
      return { success: false, error: 'Förslag hittades inte' };
    }

    await suggestion.deleteOne();

    revalidatePath('/admin/suggestions');
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
 * Delete user (admin only)
 */
export async function deleteUser(userId: string) {
  try {
    await requireAdmin();

    await connectDB();
    const user = await User.findById(userId);

    if (!user) {
      return { success: false, error: 'Användare hittades inte' };
    }

    // Prevent deleting admins
    if (user.role === 'admin') {
      return { success: false, error: 'Kan inte ta bort en administratör' };
    }

    await user.deleteOne();

    revalidatePath('/admin/users');
    return { success: true, message: 'Användare borttagen' };
  } catch (error) {
    console.error('Error deleting user:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Kunde inte ta bort användare' };
  }
}

/**
 * Force logout user (admin only)
 * Sets forcedLogoutAt timestamp to invalidate existing sessions
 */
export async function forceLogoutUser(userId: string) {
  try {
    await requireAdmin();

    await connectDB();
    const user = await User.findById(userId);

    if (!user) {
      return { success: false, error: 'Användare hittades inte' };
    }

    // Prevent logging out admins
    if (user.role === 'admin') {
      return { success: false, error: 'Kan inte logga ut en administratör' };
    }

    // Set forcedLogoutAt to current time to invalidate all existing tokens
    user.forcedLogoutAt = new Date();
    await user.save();

    revalidatePath('/admin/users');
    return { success: true, message: 'Användare utloggad' };
  } catch (error) {
    console.error('Error forcing logout:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Kunde inte logga ut användare' };
  }
}

/**
 * Reset voting cycle (admin only)
 * Moves currently_reading book to read and approved to pending
 * Clears all votes to start fresh voting
 */
export async function resetVotingCycle() {
  try {
    await requireAdmin();

    await connectDB();

    // Move currently_reading book to read (if exists)
    const currentlyReading = await BookSuggestion.findOne({ status: 'currently_reading' });
    if (currentlyReading) {
      currentlyReading.status = 'read';
      await currentlyReading.save();
    }

    // Move approved book back to pending (if exists)
    const approved = await BookSuggestion.findOne({ status: 'approved' });
    if (approved) {
      approved.status = 'pending';
      await approved.save();
    }

    // Clear all votes from all pending books to start fresh
    await BookSuggestion.updateMany(
      { status: 'pending' },
      { $set: { votes: [] } }
    );

    revalidatePath('/admin/suggestions');
    revalidatePath('/suggestions');
    revalidatePath('/Vote');
    revalidatePath('/BooksRead');

    return {
      success: true,
      message: 'Röstningsomgång återställd. Alla röster har rensats och böcker har flyttats.'
    };
  } catch (error) {
    console.error('Error resetting voting cycle:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Kunde inte återställa röstningsomgång' };
  }
}
