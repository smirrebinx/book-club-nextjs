import Fuse from 'fuse.js';
import { useMemo, useState } from 'react';

/**
 * Input validation for search queries
 * - Trims whitespace
 * - Enforces max length of 100 characters
 * - Returns sanitized value
 */
export function validateSearchInput(input: string): string {
  const trimmed = input.trim();
  const maxLength = 100;

  if (trimmed.length > maxLength) {
    return trimmed.substring(0, maxLength);
  }

  return trimmed;
}

interface UseFuzzySearchOptions<T> {
  /** Data to search through */
  data: T[];
  /** Keys to search on (e.g., ['title', 'author', 'description']) */
  keys: string[];
  /** Fuzzy matching threshold (0.0 = exact match, 1.0 = match anything). Default: 0.3 */
  threshold?: number;
  /** Minimum query length before searching. Default: 1 */
  minQueryLength?: number;
}

interface UseFuzzySearchResult<T> {
  /** Filtered results based on search query */
  results: T[];
  /** Current search query (validated) */
  query: string;
  /** Update search query */
  setQuery: (query: string) => void;
  /** Whether search is active */
  isSearching: boolean;
}

/**
 * Custom hook for client-side fuzzy search using Fuse.js
 *
 * Features:
 * - Fuzzy matching with configurable threshold
 * - Input validation (max 100 chars, trimmed)
 * - Searches across multiple fields
 * - Maintains security practices
 *
 * @example
 * const { results, query, setQuery, isSearching } = useFuzzySearch({
 *   data: books,
 *   keys: ['title', 'author', 'description'],
 *   threshold: 0.3
 * });
 */
export function useFuzzySearch<T>({
  data,
  keys,
  threshold = 0.3,
  minQueryLength = 1,
}: UseFuzzySearchOptions<T>): UseFuzzySearchResult<T> {
  const [query, setQueryInternal] = useState('');

  // Initialize Fuse instance with memoization for performance
  const fuse = useMemo(() => {
    return new Fuse(data, {
      keys,
      threshold,
      // Include score for potential debugging
      includeScore: false,
      // Search in all locations of the string (not just at the beginning)
      ignoreLocation: true,
      // Use extended search for better matching
      useExtendedSearch: false,
      // Find matches at word boundaries
      findAllMatches: true,
      // Minimum character length for matching
      minMatchCharLength: 1,
      // Distance: Maximum distance a match can be from the expected location
      // Higher value = more lenient with position of typos
      distance: 100,
      // Use case-insensitive matching
      isCaseSensitive: false,
    });
  }, [data, keys, threshold]);

  // Validate and set query
  const setQuery = (newQuery: string) => {
    const validated = validateSearchInput(newQuery);
    setQueryInternal(validated);
  };

  // Compute filtered results
  const results = useMemo(() => {
    const trimmedQuery = query.trim();

    // Return all data if query is too short
    if (trimmedQuery.length < minQueryLength) {
      return data;
    }

    // Perform fuzzy search
    const searchResults = fuse.search(trimmedQuery);
    return searchResults.map(result => result.item);
  }, [query, fuse, data, minQueryLength]);

  const isSearching = query.trim().length >= minQueryLength;

  return {
    results,
    query,
    setQuery,
    isSearching,
  };
}
