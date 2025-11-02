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
    id: string;
    title: string;
    author: string;
    coverImage?: string;
    isbn?: string;
  };
}>;

/**
 * Helper: Parse form data for meeting updates
 */
function parseFormDataToMeetingUpdate(formData: FormData, currentMeeting: MeetingData): PartialMeetingUpdate {
  const data: PartialMeetingUpdate = {};

  const id = formData.get('id');
  const date = formData.get('date');
  const time = formData.get('time');
  const location = formData.get('location');
  const additionalInfo = formData.get('additionalInfo');

  if (id) data.id = id as string;
  if (date) data.date = date as string;
  if (time) data.time = time as string;
  if (location) data.location = location as string;
  if (additionalInfo !== null) data.additionalInfo = additionalInfo as string;

  const bookId = formData.get('bookId');
  const bookTitle = formData.get('bookTitle');
  const bookAuthor = formData.get('bookAuthor');

  if (bookId || bookTitle || bookAuthor) {
    data.book = {
      id: bookId as string || currentMeeting.book.id,
      title: bookTitle as string || currentMeeting.book.title,
      author: bookAuthor as string || currentMeeting.book.author,
      coverImage: formData.get('bookCoverImage') as string || currentMeeting.book.coverImage,
      isbn: formData.get('bookIsbn') as string || currentMeeting.book.isbn,
    };
  }

  return data;
}

/**
 * Helper: Sanitize book data
 */
function sanitizeBookData(book: { id: string; title: string; author: string; coverImage?: string; isbn?: string }) {
  return {
    id: DOMPurify.sanitize(book.id, { ALLOWED_TAGS: [] }),
    title: DOMPurify.sanitize(book.title, { ALLOWED_TAGS: [] }),
    author: DOMPurify.sanitize(book.author, { ALLOWED_TAGS: [] }),
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
      id: DOMPurify.sanitize(validated.id, { ALLOWED_TAGS: [] }),
      date: DOMPurify.sanitize(validated.date, { ALLOWED_TAGS: [] }),
      time: DOMPurify.sanitize(validated.time, { ALLOWED_TAGS: [] }),
      location: DOMPurify.sanitize(validated.location, { ALLOWED_TAGS: [] }),
      book: {
        id: DOMPurify.sanitize(validated.book.id, { ALLOWED_TAGS: [] }),
        title: DOMPurify.sanitize(validated.book.title, { ALLOWED_TAGS: [] }),
        author: DOMPurify.sanitize(validated.book.author, { ALLOWED_TAGS: [] }),
        coverImage: validated.book.coverImage
          ? DOMPurify.sanitize(validated.book.coverImage, { ALLOWED_TAGS: [] })
          : undefined,
        isbn: validated.book.isbn
          ? DOMPurify.sanitize(validated.book.isbn, { ALLOWED_TAGS: [] })
          : undefined,
      },
      additionalInfo: DOMPurify.sanitize(validated.additionalInfo, { ALLOWED_TAGS: [] }),
    };

    await connectDB();

    const meeting = await Meeting.create(sanitized);

    revalidatePath('/admin/meetings');
    revalidatePath('/NextMeeting');
    return { success: true, message: 'Möte skapat', data: meeting };
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

    Object.assign(meeting, sanitized);
    await meeting.save();

    revalidatePath('/admin/meetings');
    revalidatePath('/NextMeeting');
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
    return { success: true, message: 'Möte borttaget' };
  } catch (error) {
    console.error('Error deleting meeting:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Kunde inte ta bort möte' };
  }
}
