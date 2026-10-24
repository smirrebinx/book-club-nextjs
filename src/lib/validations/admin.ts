import { z } from 'zod';

// MongoDB ObjectId validation regex
const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const approveUserSchema = z.object({
  userId: z.string().regex(objectIdRegex, 'Ogiltigt användar-ID')
});

export const changeRoleSchema = z.object({
  userId: z.string().regex(objectIdRegex, 'Ogiltigt användar-ID'),
  role: z.enum(['pending', 'user', 'admin'], {
    message: 'Rollen måste vara pending, user eller admin'
  })
});

export const updateSuggestionStatusSchema = z.object({
  suggestionId: z.string().regex(objectIdRegex, 'Ogiltigt förslags-ID'),
  status: z.enum(['pending', 'approved', 'currently_reading', 'read', 'rejected'], {
    message: 'Status måste vara pending, approved, currently_reading, read eller rejected'
  })
});

export const deleteSuggestionSchema = z.object({
  suggestionId: z.string().regex(objectIdRegex, 'Ogiltigt förslags-ID')
});

export const deleteUserSchema = z.object({
  userId: z.string().regex(objectIdRegex, 'Ogiltigt användar-ID')
});

export const forceLogoutUserSchema = z.object({
  userId: z.string().regex(objectIdRegex, 'Ogiltigt användar-ID')
});

export type ApproveUserInput = z.infer<typeof approveUserSchema>;
export type ChangeRoleInput = z.infer<typeof changeRoleSchema>;
export type UpdateSuggestionStatusInput = z.infer<typeof updateSuggestionStatusSchema>;
export type DeleteSuggestionInput = z.infer<typeof deleteSuggestionSchema>;
export type DeleteUserInput = z.infer<typeof deleteUserSchema>;
export type ForceLogoutUserInput = z.infer<typeof forceLogoutUserSchema>;
