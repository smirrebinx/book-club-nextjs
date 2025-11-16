'use server';

import DOMPurify from 'isomorphic-dompurify';
import { revalidatePath } from 'next/cache';

import { requireAdmin } from '@/lib/auth-helpers';
import connectDB from '@/lib/mongodb';
import { createMeetingSchema, updateMeetingSchema } from '@/lib/validations/meetings';
import Meeting from '@/models/Meeting';

import type { MeetingData } from '@/types/meeting';

type PartialMeetingUpdate = Partial<{
  id: string;
  date: string;
  time: string;
  location: string;
  additionalInfo: string;
  book: {
    id?: string;
    title?: string;
    author?: string;
    coverImage?: string;
    isbn?: string;
  };
}>;

/**
 * Helper: Get form field or return undefined
 */
function getFormField(formData: FormData, fieldName: string): string | undefined {
  const value = formData.get(fieldName);
  // Return the value if it exists (including empty strings), otherwise undefined
  return value !== null ? (value as string) : undefined;
}

/**
 * Helper: Get field value with fallback
 */
function getFieldWithFallback(formValue: string | undefined, currentValue: string | undefined): string | undefined {
  return formValue || currentValue || undefined;
}

/**
 * Helper: Parse book data from form
 */
function parseBookData(formData: FormData, currentBook?: { id?: string; title?: string; author?: string; coverImage?: string; isbn?: string }) {
  const bookId = getFormField(formData, 'bookId');
  const bookTitle = getFormField(formData, 'bookTitle');
  const bookAuthor = getFormField(formData, 'bookAuthor');

  if (!bookId && !bookTitle && !bookAuthor) {
    return undefined;
  }

  return {
    id: getFieldWithFallback(bookId, currentBook?.id),
    title: getFieldWithFallback(bookTitle, currentBook?.title),
    author: getFieldWithFallback(bookAuthor, currentBook?.author),
    coverImage: getFieldWithFallback(getFormField(formData, 'bookCoverImage'), currentBook?.coverImage),
    isbn: getFieldWithFallback(getFormField(formData, 'bookIsbn'), currentBook?.isbn),
  };
}

/**
 * Helper: Parse form data for meeting updates
 */
function parseFormDataToMeetingUpdate(formData: FormData, currentMeeting: MeetingData): PartialMeetingUpdate {
  const data: PartialMeetingUpdate = {};

  const id = getFormField(formData, 'id');
  const date = getFormField(formData, 'date');
  const time = getFormField(formData, 'time');
  const location = getFormField(formData, 'location');
  const additionalInfo = getFormField(formData, 'additionalInfo');

  if (id) data.id = id;
  if (date) data.date = date;
  if (time) data.time = time;
  if (location) data.location = location;
  if (additionalInfo !== undefined) data.additionalInfo = additionalInfo;

  const book = parseBookData(formData, currentMeeting.book);
  if (book) data.book = book;

  return data;
}

/**
 * Helper: Sanitize book data
 */
function sanitizeBookData(book: { id?: string; title?: string; author?: string; coverImage?: string; isbn?: string }): {
  id?: string;
  title?: string;
  author?: string;
  coverImage?: string;
  isbn?: string;
} {
  return {
    id: book.id ? DOMPurify.sanitize(book.id, { ALLOWED_TAGS: [] }) : undefined,
    title: book.title ? DOMPurify.sanitize(book.title, { ALLOWED_TAGS: [] }) : undefined,
    author: book.author ? DOMPurify.sanitize(book.author, { ALLOWED_TAGS: [] }) : undefined,
    coverImage: book.coverImage
      ? DOMPurify.sanitize(book.coverImage, { ALLOWED_TAGS: [] })
      : undefined,
    isbn: book.isbn
      ? DOMPurify.sanitize(book.isbn, { ALLOWED_TAGS: [] })
      : undefined,
  };
}

/**
 * Helper: Sanitize meeting data
 */
function sanitizeMeetingData(validated: PartialMeetingUpdate): PartialMeetingUpdate {
  const sanitized: PartialMeetingUpdate = {};

  if (validated.id) {
    sanitized.id = DOMPurify.sanitize(validated.id, { ALLOWED_TAGS: [] });
  }
  if (validated.date) {
    sanitized.date = DOMPurify.sanitize(validated.date, { ALLOWED_TAGS: [] });
  }
  if (validated.time) {
    sanitized.time = DOMPurify.sanitize(validated.time, { ALLOWED_TAGS: [] });
  }
  if (validated.location) {
    sanitized.location = DOMPurify.sanitize(validated.location, { ALLOWED_TAGS: [] });
  }
  if (validated.additionalInfo !== undefined) {
    sanitized.additionalInfo = DOMPurify.sanitize(validated.additionalInfo, { ALLOWED_TAGS: [] });
  }
  if (validated.book) {
    sanitized.book = sanitizeBookData(validated.book);
  }

  return sanitized;
}

/**
 * Create a new meeting (admin only)
 */
export async function createMeeting(formData: FormData) {
  try {
    await requireAdmin();

    // Parse form data
    const data = {
      id: formData.get('id') as string,
      date: formData.get('date') as string,
      time: formData.get('time') as string,
      location: formData.get('location') as string,
      book: {
        id: formData.get('bookId') as string,
        title: formData.get('bookTitle') as string,
        author: formData.get('bookAuthor') as string,
        coverImage: formData.get('bookCoverImage') as string | undefined,
        isbn: formData.get('bookIsbn') as string | undefined,
      },
      additionalInfo: formData.get('additionalInfo') as string || '',
    };

    // Validate with Zod
    const validated = createMeetingSchema.parse(data);

    // Sanitize inputs
    const sanitized = {
      id: validated.id ? DOMPurify.sanitize(validated.id, { ALLOWED_TAGS: [] }) : undefined,
      date: validated.date ? DOMPurify.sanitize(validated.date, { ALLOWED_TAGS: [] }) : undefined,
      time: validated.time ? DOMPurify.sanitize(validated.time, { ALLOWED_TAGS: [] }) : undefined,
      location: validated.location ? DOMPurify.sanitize(validated.location, { ALLOWED_TAGS: [] }) : undefined,
      book: validated.book ? {
        id: validated.book.id ? DOMPurify.sanitize(validated.book.id, { ALLOWED_TAGS: [] }) : undefined,
        title: validated.book.title ? DOMPurify.sanitize(validated.book.title, { ALLOWED_TAGS: [] }) : undefined,
        author: validated.book.author ? DOMPurify.sanitize(validated.book.author, { ALLOWED_TAGS: [] }) : undefined,
        coverImage: validated.book.coverImage
          ? DOMPurify.sanitize(validated.book.coverImage, { ALLOWED_TAGS: [] })
          : undefined,
        isbn: validated.book.isbn
          ? DOMPurify.sanitize(validated.book.isbn, { ALLOWED_TAGS: [] })
          : undefined,
      } : undefined,
      additionalInfo: validated.additionalInfo ? DOMPurify.sanitize(validated.additionalInfo, { ALLOWED_TAGS: [] }) : undefined,
    };

    await connectDB();

    // Filter out undefined values to avoid Mongoose issues in serverless
    const filterUndefined = (obj: Record<string, unknown>): Record<string, unknown> | undefined => {
      if (obj === null || obj === undefined) return undefined;
      if (typeof obj !== 'object') return obj as Record<string, unknown>;
      if (Array.isArray(obj)) return obj as unknown as Record<string, unknown>;

      const filtered: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined) {
          if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
            filtered[key] = filterUndefined(value as Record<string, unknown>);
          } else {
            filtered[key] = value;
          }
        }
      }
      return Object.keys(filtered).length > 0 ? filtered : undefined;
    };

    const cleanedData = filterUndefined(sanitized as Record<string, unknown>);
    
    // Keep variable meeting for debugging
    const _meeting = await Meeting.create(cleanedData); 

    revalidatePath('/admin/meetings');
    revalidatePath('/NextMeeting');
    revalidatePath('/');
    return { success: true, message: 'Möte skapat' };
  } catch (error) {
    console.error('Error creating meeting:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Kunde inte skapa möte' };
  }
}

/**
 * Update a meeting (admin only)
 */
export async function updateMeeting(meetingId: string, formData: FormData) {
  try {
    await requireAdmin();

    await connectDB();
    const meeting = await Meeting.findById(meetingId);

    if (!meeting) {
      return { success: false, error: 'Möte hittades inte' };
    }

    const data = parseFormDataToMeetingUpdate(formData, meeting);
    const validated = updateMeetingSchema.parse(data);
    const sanitized = sanitizeMeetingData(validated);

    // Use Mongoose set() to properly handle all updates including empty strings
    meeting.set(sanitized);
    await meeting.save();

    revalidatePath('/admin/meetings');
    revalidatePath('/NextMeeting');
    revalidatePath('/');
    return { success: true, message: 'Möte uppdaterat' };
  } catch (error) {
    console.error('Error updating meeting:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Kunde inte uppdatera möte' };
  }
}

/**
 * Delete a meeting (admin only)
 */
export async function deleteMeeting(meetingId: string) {
  try {
    await requireAdmin();

    await connectDB();
    const meeting = await Meeting.findById(meetingId);

    if (!meeting) {
      return { success: false, error: 'Möte hittades inte' };
    }

    await meeting.deleteOne();

    revalidatePath('/admin/meetings');
    revalidatePath('/NextMeeting');
    revalidatePath('/');
    return { success: true, message: 'Möte borttaget' };
  } catch (error) {
    console.error('Error deleting meeting:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Kunde inte ta bort möte' };
  }
}
