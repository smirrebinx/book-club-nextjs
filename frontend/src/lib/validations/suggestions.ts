import { z } from 'zod';

export const createSuggestionSchema = z.object({
  title: z.string()
    .min(1, 'Titel krävs')
    .max(200, 'Titeln får max vara 200 tecken'),
  author: z.string()
    .min(1, 'Författare krävs')
    .max(100, 'Författarnamnet får max vara 100 tecken'),
  description: z.string()
    .max(1000, 'Motiveringen får max vara 1000 tecken')
    .optional()
    .default(''),
  isbn: z.union([z.string(), z.null()])
    .optional()
    .transform(val => val || undefined),
  coverImage: z.union([
    z.string().url('Omslagsbildens URL måste vara giltig'),
    z.literal(''),
    z.null()
  ])
    .optional()
    .transform(val => val || undefined),
  googleBooksId: z.union([z.string(), z.null()])
    .optional()
    .transform(val => val || undefined),
  googleDescription: z.union([z.string(), z.null()])
    .optional()
    .transform(val => val || undefined)
});

export const updateSuggestionSchema = z.object({
  title: z.string()
    .min(1, 'Titel krävs')
    .max(200, 'Titeln får max vara 200 tecken')
    .optional(),
  author: z.string()
    .min(1, 'Författare krävs')
    .max(100, 'Författarnamnet får max vara 100 tecken')
    .optional(),
  description: z.string()
    .max(1000, 'Motiveringen får max vara 1000 tecken')
    .optional()
    .default('')
});

export const voteSchema = z.object({
  suggestionId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Ogiltigt förslags-ID')
});

export type CreateSuggestionInput = z.infer<typeof createSuggestionSchema>;
export type UpdateSuggestionInput = z.infer<typeof updateSuggestionSchema>;
export type VoteInput = z.infer<typeof voteSchema>;
