import { z } from 'zod';

export const approveUserSchema = z.object({
  userId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Ogiltigt användar-ID')
});

export const changeRoleSchema = z.object({
  userId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Ogiltigt användar-ID'),
  role: z.enum(['pending', 'user', 'admin'], {
    required_error: 'Roll krävs',
    invalid_type_error: 'Rollen måste vara pending, user eller admin'
  })
});

export const updateSuggestionStatusSchema = z.object({
  suggestionId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Ogiltigt förslags-ID'),
  status: z.enum(['pending', 'approved', 'currently_reading', 'rejected'], {
    required_error: 'Status krävs',
    invalid_type_error: 'Status måste vara pending, approved, currently_reading eller rejected'
  })
});

export type ApproveUserInput = z.infer<typeof approveUserSchema>;
export type ChangeRoleInput = z.infer<typeof changeRoleSchema>;
export type UpdateSuggestionStatusInput = z.infer<typeof updateSuggestionStatusSchema>;
