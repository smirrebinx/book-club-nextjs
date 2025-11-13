import { z } from 'zod';

export const bookInfoSchema = z.object({
  id: z.string().optional(),
  title: z.string().optional(),
  author: z.string().optional(),
  coverImage: z.union([
    z.string().url('Ogiltig bild-URL'),
    z.literal(''),
    z.null()
  ]).optional().transform(val => val || undefined),
  isbn: z.string().optional()
});

export const createMeetingSchema = z.object({
  id: z.string().optional(),
  date: z.string().optional(),
  time: z.string().optional(),
  location: z.string().optional(),
  book: bookInfoSchema.optional(),
  additionalInfo: z.string().optional().default('')
});

export const updateMeetingSchema = z.object({
  id: z.string().optional(),
  date: z.string().optional(),
  time: z.string().optional(),
  location: z.string().optional(),
  book: bookInfoSchema.optional(),
  additionalInfo: z.string().optional()
});

export type CreateMeetingInput = z.infer<typeof createMeetingSchema>;
export type UpdateMeetingInput = z.infer<typeof updateMeetingSchema>;
