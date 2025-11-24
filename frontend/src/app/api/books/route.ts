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

interface GoogleBooksResponse {
  items?: BookItem[];
  totalItems?: number;
}

// Truncate description helper
function truncateDescription(description: string | undefined): string | undefined {
  if (!description) return undefined;
  if (description.length <= 2000) return description;
  return description.substring(0, 1997) + '...';
}

// Format a single book item
function formatBookItem(item: BookItem) {
  return {
    id: item.id,
    title: item.volumeInfo?.title || 'Unknown Title',
    authors: item.volumeInfo?.authors || [],
    author: item.volumeInfo?.authors?.[0] || 'Unknown Author',
    publishedDate: item.volumeInfo?.publishedDate,
    description: truncateDescription(item.volumeInfo?.description),
    coverImage: item.volumeInfo?.imageLinks?.thumbnail,
    isbn: item.volumeInfo?.industryIdentifiers?.find(
      (id: IndustryIdentifier) => id.type === 'ISBN_13' || id.type === 'ISBN_10'
    )?.identifier,
  };
}

// Extract book formatting logic
function formatBooks(items: BookItem[] | undefined) {
  if (!items) return [];
  return items.map(formatBookItem);
}

// Validate request and API key
function validateRequest(query: string | null) {
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

  return null;
}

// Build Google Books API URL
function buildApiUrl(query: string, apiKey: string, languageRestrict: boolean): string {
  const baseUrl = 'https://www.googleapis.com/books/v1/volumes';
  const params = new URLSearchParams({
    q: query,
    key: apiKey,
    maxResults: '20',
    printType: 'books',
  });

  if (languageRestrict) {
    params.append('langRestrict', 'sv');
  }

  return `${baseUrl}?${params.toString()}`;
}

// Fetch books from Google Books API
async function fetchGoogleBooks(url: string): Promise<GoogleBooksResponse> {
  const response = await fetch(url);

  if (!response.ok) {
    console.error('Google Books API error:', response.status, response.statusText);
    throw new Error(`Google Books API error: ${response.statusText}`);
  }

  return response.json();
}

// Try fallback search without language restriction
async function tryFallbackSearch(query: string, apiKey: string): Promise<GoogleBooksResponse | null> {
  console.log('No Swedish results, trying international search...');
  const fallbackUrl = buildApiUrl(query, apiKey, false);
  
  try {
    const fallbackData = await fetchGoogleBooks(fallbackUrl);
    console.log('International search returned:', fallbackData.totalItems || 0, 'results');
    return fallbackData;
  } catch {
    return null;
  }
}

// Check if search results are empty
function hasResults(data: GoogleBooksResponse): boolean {
  return Boolean(data.items && data.items.length > 0);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    // Validate request
    const validationError = validateRequest(query);
    if (validationError) {
      return validationError;
    }

    // Type guard: at this point query and API key are guaranteed to exist
    if (!query || !GOOGLE_BOOKS_API_KEY) {
      throw new Error('Validation passed but missing required values');
    }

    // Search with Swedish language preference first
    const apiUrl = buildApiUrl(query, GOOGLE_BOOKS_API_KEY, true);
    console.log('Searching Google Books API with query:', query);

    let data = await fetchGoogleBooks(apiUrl);
    console.log('Google Books API returned:', data.totalItems || 0, 'results');

    // If no Swedish results, try without language restriction
    if (!hasResults(data)) {
      const fallbackData = await tryFallbackSearch(query, GOOGLE_BOOKS_API_KEY);
      if (fallbackData) {
        data = fallbackData;
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