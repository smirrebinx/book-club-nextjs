import { NextResponse } from 'next/server';

import type { NextRequest} from 'next/server';

const GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY;

// Google Books API response types
interface IndustryIdentifier {
  type: string;
  identifier: string;
}

interface VolumeInfo {
  title?: string;
  authors?: string[];
  publishedDate?: string;
  description?: string;
  imageLinks?: {
    thumbnail?: string;
  };
  industryIdentifiers?: IndustryIdentifier[];
}

interface BookItem {
  id: string;
  volumeInfo?: VolumeInfo;
}

// Extract book formatting logic to reduce complexity
function formatBooks(items: BookItem[] | undefined) {
  return items?.map((item: BookItem) => {
    // Truncate description to 2000 characters if needed
    const rawDescription = item.volumeInfo?.description;
    const description = rawDescription && rawDescription.length > 2000
      ? rawDescription.substring(0, 1997) + '...'
      : rawDescription;

    return {
      id: item.id,
      title: item.volumeInfo?.title || 'Unknown Title',
      authors: item.volumeInfo?.authors || [],
      author: item.volumeInfo?.authors?.[0] || 'Unknown Author',
      publishedDate: item.volumeInfo?.publishedDate,
      description,
      coverImage: item.volumeInfo?.imageLinks?.thumbnail,
      isbn: item.volumeInfo?.industryIdentifiers?.find(
        (id: IndustryIdentifier) => id.type === 'ISBN_13' || id.type === 'ISBN_10'
      )?.identifier,
    };
  }) || [];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }

    if (!GOOGLE_BOOKS_API_KEY) {
      console.error('GOOGLE_BOOKS_API_KEY is not set');
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // Call Google Books API with language preferences
    const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&key=${GOOGLE_BOOKS_API_KEY}&maxResults=20&langRestrict=sv&printType=books`;

    console.log('Searching Google Books API with query:', query);

    const response = await fetch(apiUrl);

    if (!response.ok) {
      console.error('Google Books API error:', response.status, response.statusText);
      throw new Error(`Google Books API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Google Books API returned:', data.totalItems || 0, 'results');

    // If no Swedish results, try without language restriction
    if (!data.items || data.items.length === 0) {
      console.log('No Swedish results, trying international search...');
      const fallbackUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&key=${GOOGLE_BOOKS_API_KEY}&maxResults=20&printType=books`;
      const fallbackResponse = await fetch(fallbackUrl);

      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        console.log('International search returned:', fallbackData.totalItems || 0, 'results');

        const books = formatBooks(fallbackData.items);
        return NextResponse.json({ books, total: fallbackData.totalItems || 0 });
      }
    }

    const books = formatBooks(data.items);
    return NextResponse.json({ books, total: data.totalItems || 0 });
  } catch (error) {
    console.error('Error fetching books:', error);
    return NextResponse.json(
      { error: 'Failed to fetch books' },
      { status: 500 }
    );
  }
}