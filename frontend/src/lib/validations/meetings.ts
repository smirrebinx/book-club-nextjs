import { z } from 'zod';

export const bookInfoSchema = z.object({
  id: z.string().min(1, 'Bok-ID krävs'),
  title: z.string().min(1, 'Boktitel krävs'),
  author: z.string().min(1, 'Författare krävs'),
  coverImage: z.string().url('Ogiltig bild-URL').optional(),
  isbn: z.string().optional()
});

export const createMeetingSchema = z.object({
  id: z.string().min(1, 'Mötes-ID krävs'),
  date: z.string().min(1, 'Datum krävs'),
  time: z.string().min(1, 'Tid krävs'),
  location: z.string().min(1, 'Plats krävs'),
  book: bookInfoSchema,
  additionalInfo: z.string().default('')
});

export const updateMeetingSchema = z.object({
  id: z.string().min(1, 'Mötes-ID krävs').optional(),
  date: z.string().min(1, 'Datum krävs').optional(),
  time: z.string().min(1, 'Tid krävs').optional(),
  location: z.string().min(1, 'Plats krävs').optional(),
  book: bookInfoSchema.optional(),
  additionalInfo: z.string().optional()
});

export type CreateMeetingInput = z.infer<typeof createMeetingSchema>;
export type UpdateMeetingInput = z.infer<typeof updateMeetingSchema>;
