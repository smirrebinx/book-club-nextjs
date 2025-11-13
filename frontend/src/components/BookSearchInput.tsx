'use client';

import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';

interface BookResult {
  id: string;
  title: string;
  author: string;
  authors: string[];
  coverImage?: string;
  isbn?: string;
  publishedDate?: string;
  description?: string;
  googleBooksId?: string;
}

interface BookSearchInputProps {
  onSelectBook: (book: BookResult) => void;
  disabled?: boolean;
}

export function BookSearchInput({ onSelectBook, disabled = false }: BookSearchInputProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<BookResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    setError(null);

    searchTimeoutRef.current = setTimeout(() => {
      void searchBooks(query);
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query]);

  const searchBooks = async (searchQuery: string) => {
    try {
      const response = await fetch(`/api/books?q=${encodeURIComponent(searchQuery)}`);

      if (!response.ok) {
        throw new Error('Kunde inte söka böcker');
      }

      const data = await response.json();
      setResults(data.books || []);
      setShowResults(true);
    } catch {
      setError('Ett fel uppstod vid sökning');
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectBook = (book: BookResult) => {
    // Pass book with googleBooksId set to the id field
    onSelectBook({
      ...book,
      googleBooksId: book.id,
    });
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowResults(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <label htmlFor="book-search" className="block text-sm font-medium text-[var(--primary-text)] mb-1">
        Sök efter bok genom Google Books
      </label>
      <input
        type="text"
        id="book-search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        role="combobox"
        className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-[var(--focus-border)] focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
        style={{ '--tw-ring-color': 'var(--focus-ring)' } as React.CSSProperties}
        placeholder="Skriv boktitel eller författare på svenska eller engelska..."
        aria-describedby="search-help"
        aria-expanded={showResults}
        aria-controls="search-results"
        aria-autocomplete="list"
      />

      {isSearching && (
        <div className="absolute top-full left-0 right-0 mt-1 p-3 bg-white border border-gray-300 rounded-md shadow-lg z-10">
          <p className="text-sm text-gray-600">Söker...</p>
        </div>
      )}

      {error && (
        <div className="absolute top-full left-0 right-0 mt-1 p-3 bg-white border border-red-300 rounded-md shadow-lg z-10">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {showResults && results.length > 0 && !isSearching && (
        <div
          id="search-results"
          role="listbox"
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-96 overflow-y-auto z-10"
        >
          {results.map((book) => (
            <button
              key={book.id}
              type="button"
              role="option"
              aria-selected="false"
              onClick={() => handleSelectBook(book)}
              className="w-full p-3 hover:bg-gray-50 focus:bg-gray-50 focus:outline-2 focus:outline-offset-2 text-left border-b border-gray-100 last:border-b-0 transition-colors"
              style={{ outlineColor: 'var(--focus-ring)' }}
              aria-label={`Välj boken ${book.title} av ${book.author}`}
            >
              <div className="flex gap-3">
                {book.coverImage && (
                  <div className="relative w-12 h-16 flex-shrink-0">
                    <Image
                      src={book.coverImage}
                      alt=""
                      fill
                      sizes="48px"
                      className="object-cover rounded"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {book.title}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {book.author}
                  </p>
                  {book.publishedDate && (
                    <p className="text-xs text-gray-500 mt-1">
                      {book.publishedDate}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {showResults && results.length === 0 && !isSearching && query.trim().length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-1 p-3 bg-white border border-gray-300 rounded-md shadow-lg z-10">
          <p className="text-sm text-gray-600">Inga böcker hittades</p>
        </div>
      )}
    </div>
  );
}
