import { z } from 'zod';

// MongoDB ObjectId validation regex
const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const bookInfoSchema = z.object({
  id: z.string().max(100).optional(),
  title: z.string().max(200).optional(),
  author: z.string().max(200).optional(),
  coverImage: z.union([
    z.string().url('Ogiltig bild-URL').max(500),
    z.literal(''),
    z.null()
  ]).optional().transform(val => val || undefined),
  isbn: z.string().max(20).optional()
});

export const createMeetingSchema = z.object({
  id: z.string().min(1).max(100).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ogiltigt datumformat (YYYY-MM-DD)'),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Ogiltigt tidsformat (HH:MM)'),
  location: z.string().min(1).max(200),
  book: bookInfoSchema.optional(),
  additionalInfo: z.string().max(2000).optional().default('')
});

export const updateMeetingSchema = z.object({
  id: z.string().max(100).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ogiltigt datumformat (YYYY-MM-DD)').optional(),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Ogiltigt tidsformat (HH:MM)').optional(),
  location: z.string().min(1).max(200).optional(),
  book: bookInfoSchema.optional(),
  additionalInfo: z.string().max(2000).optional()
});

export const deleteMeetingSchema = z.object({
  meetingId: z.string().regex(objectIdRegex, 'Ogiltigt mötes-ID')
});

export const meetingIdSchema = z.object({
  meetingId: z.string().regex(objectIdRegex, 'Ogiltigt mötes-ID')
});

export type CreateMeetingInput = z.infer<typeof createMeetingSchema>;
export type UpdateMeetingInput = z.infer<typeof updateMeetingSchema>;
export type DeleteMeetingInput = z.infer<typeof deleteMeetingSchema>;
export type MeetingIdInput = z.infer<typeof meetingIdSchema>;
