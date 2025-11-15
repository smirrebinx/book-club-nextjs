'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useOptimistic, useTransition, useState } from 'react';

import { toggleVote } from '@/app/suggestions/actions';

import type { SuggestionStatus } from '@/models/BookSuggestion';

function ExpandableDescription({ description, bookTitle }: { description: string; bookTitle: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = description.length > 200;

  return (
    <div>
      <p className={`text-xs sm:text-sm text-gray-700 ${!isExpanded && shouldTruncate ? 'line-clamp-3' : ''}`}>
        {description}
      </p>
      {shouldTruncate && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs sm:text-sm text-[var(--link-color)] hover:text-[var(--link-hover)] hover:underline mt-1 focus:outline-2 focus:outline-offset-2"
          style={{ outlineColor: 'var(--focus-ring)' }}
        >
          {isExpanded ? 'Visa mindre' : `Läs mer om ${bookTitle}`}
        </button>
      )}
    </div>
  );
}

interface Suggestion {
  _id: string;
  title: string;
  author: string;
  description: string;
  googleDescription?: string;
  status: SuggestionStatus;
  votes: string[];
  voteCount: number;
  hasVoted: boolean;
  suggestedBy: {
    name: string;
  };
  createdAt: string;
  coverImage?: string;
  isbn?: string;
}

export function VotingList({
  suggestions,
}: {
  suggestions: Suggestion[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimisticSuggestions, setOptimisticSuggestions] = useOptimistic(suggestions);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleVote = async (suggestionId: string) => {
    const suggestion = suggestions.find((s) => s._id === suggestionId);
    if (!suggestion) return;

    startTransition(async () => {
      // Optimistic update inside transition
      setOptimisticSuggestions(
        suggestions.map((s) =>
          s._id === suggestionId
            ? {
                ...s,
                hasVoted: !s.hasVoted,
                voteCount: s.hasVoted ? s.voteCount - 1 : s.voteCount + 1,
              }
            : s
        )
      );

      const result = await toggleVote(suggestionId);
      if (result.success) {
        setMessage({ text: result.message || 'Röst registrerad', type: 'success' });
        router.refresh();
        // Clear message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ text: result.error || 'Ett fel uppstod', type: 'error' });
        // Revert optimistic update on error
        router.refresh();
        setTimeout(() => setMessage(null), 5000);
      }
    });
  };

  // Sort by vote count (descending)
  const sortedSuggestions = [...optimisticSuggestions].sort((a, b) => b.voteCount - a.voteCount);

  return (
    <div>
      {/* Success/Error message - WCAG AA compliant */}
      {message && (
        <div
          role={message.type === 'error' ? 'alert' : 'status'}
          aria-live={message.type === 'error' ? 'assertive' : 'polite'}
          className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          <p
            className={`text-sm font-medium ${
              message.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}
          >
            {message.text}
          </p>
        </div>
      )}

      <div className="space-y-4">
        {sortedSuggestions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>Inga bokförslag att rösta på ännu.</p>
          </div>
        ) : (
          sortedSuggestions.map((suggestion) => (
            <div key={suggestion._id} className="bg-white rounded-lg shadow p-4 md:p-6">
              {/* Vote button - full width on mobile, vertical on desktop */}
              <div className="flex sm:flex-row items-start gap-4 sm:gap-6">
                {/* Vote button */}
                <div className="flex sm:flex-col items-center sm:items-center gap-3 sm:gap-0 w-full sm:w-auto">
                  <button
                    onClick={() => void handleVote(suggestion._id)}
                    disabled={isPending}
                    className={`p-3 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-2 focus:outline-offset-2 ${
                      suggestion.hasVoted
                        ? 'bg-[var(--button-primary-bg)] text-white hover:bg-[var(--button-primary-hover)] border-2 border-[var(--button-primary-bg)] hover:border-[var(--button-primary-hover)]'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-gray-100'
                    }`}
                    style={{ outlineColor: 'var(--focus-ring)' }}
                    aria-label={suggestion.hasVoted ? 'Ta bort röst' : 'Rösta på denna bok'}
                    title={suggestion.hasVoted ? 'Ta bort röst' : 'Rösta på denna bok'}
                  >
                    <svg
                      className="w-6 h-6 sm:w-8 sm:h-8"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                    </svg>
                  </button>
                  <div className="flex sm:flex-col items-baseline sm:items-center gap-1 sm:gap-0 sm:mt-2">
                    <span className="text-lg sm:text-xl font-bold text-gray-900">
                      {suggestion.voteCount}
                    </span>
                    <span className="text-xs text-gray-500">
                      {suggestion.voteCount === 1 ? 'röst' : 'röster'}
                    </span>
                  </div>
                </div>

                {/* Book cover and title section - side by side on all screens */}
                <div className="flex gap-4 flex-1 w-full">
                  {/* Book cover */}
                  {suggestion.coverImage && (
                    <div className="relative w-20 h-28 sm:w-24 sm:h-32 flex-shrink-0">
                      <Image
                        src={suggestion.coverImage}
                        alt={`Omslag för ${suggestion.title}`}
                        fill
                        sizes="(max-width: 640px) 80px, 96px"
                        className="object-cover rounded shadow-sm"
                      />
                    </div>
                  )}

                  {/* Book info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                      {suggestion.title}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-2 sm:mb-3">
                      av {suggestion.author}
                    </p>
                    {suggestion.isbn && (
                      <p className="text-xs text-gray-500 mb-2">ISBN: {suggestion.isbn}</p>
                    )}

                    {/* Desktop: show descriptions here */}
                    <div className="hidden sm:block">
                      {suggestion.googleDescription && (
                        <div className="mb-2 sm:mb-3">
                          <p className="text-xs sm:text-sm font-semibold text-gray-800 mb-1">Om boken:</p>
                          <ExpandableDescription
                            description={suggestion.googleDescription}
                            bookTitle={suggestion.title}
                          />
                        </div>
                      )}

                      {suggestion.description && (
                        <div className="mb-2 sm:mb-3">
                          <p className="text-xs sm:text-sm font-semibold text-gray-800 mb-1">Motivation:</p>
                          <p className="text-sm sm:text-base text-gray-700">
                            {suggestion.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile only: descriptions below cover/title section */}
              <div className="sm:hidden mt-3">
                {suggestion.googleDescription && (
                  <div className="mb-3">
                    <p className="text-xs sm:text-sm font-semibold text-gray-800 mb-1">Om boken:</p>
                    <ExpandableDescription
                      description={suggestion.googleDescription}
                      bookTitle={suggestion.title}
                    />
                  </div>
                )}

                {suggestion.description && (
                  <div className="mb-3">
                    <p className="text-xs sm:text-sm font-semibold text-gray-800 mb-1">Motivation:</p>
                    <p className="text-sm sm:text-base text-gray-700">
                      {suggestion.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer with metadata */}
              <div className="mt-3">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500">
                  <span>Föreslagen av {suggestion.suggestedBy.name}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    suggestion.status === 'approved' ? 'bg-green-100 text-green-800' :
                    suggestion.status === 'currently_reading' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {suggestion.status === 'approved' ? 'Godkänd' :
                     suggestion.status === 'currently_reading' ? 'Läser nu' :
                     'Väntande'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
