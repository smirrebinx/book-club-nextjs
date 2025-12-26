'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useOptimistic, useTransition, useState } from 'react';

import { toggleVote } from '@/app/suggestions/actions';
import { BookPlaceholder } from '@/components/BookPlaceholder';


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
          className="text-xs sm:text-sm text-[var(--link-color)] hover:text-[var(--link-hover)] hover:underline mt-1 py-2 focus:outline-2 focus:outline-offset-2 inline-block min-h-[44px] min-w-[44px]"
          style={{ outlineColor: 'var(--focus-ring)' }}
          aria-expanded={isExpanded}
        >
          {isExpanded ? 'Visa mindre' : `Läs mer om ${bookTitle}`}
        </button>
      )}
    </div>
  );
}

interface StatusBadgeProps {
  status: SuggestionStatus;
}

function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Godkänd' },
    currently_reading: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Läser nu' },
    read: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Läst' },
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Inväntar röst' },
    rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Avvisad' },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium text-center sm:text-left ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}

interface PlacementBadgeProps {
  placement: 1 | 2 | 3;
}

function PlacementBadge({ placement }: PlacementBadgeProps) {
  const badgeConfig = {
    1: { emoji: '🥇', bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-900', label: '1:a plats' },
    2: { emoji: '🥈', bg: 'bg-gray-50', border: 'border-gray-300', text: 'text-gray-900', label: '2:a plats' },
    3: { emoji: '🥉', bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-900', label: '3:e plats' },
  };

  const config = badgeConfig[placement];

  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold border-2 ${config.bg} ${config.border} ${config.text}`}
      title={config.label}
    >
      <span className="text-lg">{config.emoji}</span>
      <span>{config.label}</span>
    </span>
  );
}

interface BookDescriptionsProps {
  googleDescription?: string;
  description: string;
  title: string;
}

function BookDescriptions({ googleDescription, description, title }: BookDescriptionsProps) {
  return (
    <>
      {googleDescription && (
        <div className="mb-2 sm:mb-3">
          <p className="text-xs sm:text-sm font-semibold text-gray-800 mb-1">Om boken:</p>
          <ExpandableDescription description={googleDescription} bookTitle={title} />
        </div>
      )}

      {description && (
        <div className="mb-2 sm:mb-3">
          <p className="text-xs sm:text-sm font-semibold text-gray-800 mb-1">Motivering:</p>
          <p className="text-sm sm:text-base text-gray-700">{description}</p>
        </div>
      )}
    </>
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
  placement?: 1 | 2 | 3;
  votingRound?: string;
  suggestedBy: {
    name: string;
  };
  createdAt: string;
  coverImage?: string;
  isbn?: string;
}

export function VotingList({
  suggestions,
  isVotingLocked = false,
}: {
  suggestions: Suggestion[];
  isVotingLocked?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimisticSuggestions, setOptimisticSuggestions] = useOptimistic(suggestions);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleVote = (suggestionId: string) => {
    // Prevent voting if locked
    if (isVotingLocked) {
      setMessage({
        text: 'Röstning är låst. Vänta tills administratören startar en ny omgång.',
        type: 'error'
      });
      setTimeout(() => setMessage(null), 5000);
      return;
    }

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
              {/* Vote button - own row on mobile, vertical on desktop */}
              <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                {/* Vote button */}
                <div className="flex sm:flex-col items-center gap-3 sm:gap-0 w-full sm:w-auto justify-center sm:justify-start">
                  <button
                    onClick={() => void handleVote(suggestion._id)}
                    disabled={isPending || isVotingLocked}
                    className={`p-3 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-2 focus:outline-offset-2 ${
                      isVotingLocked
                        ? 'bg-gray-200 text-gray-400 border-2 border-gray-200 cursor-not-allowed'
                        : suggestion.hasVoted
                        ? 'bg-[var(--button-primary-bg)] text-white hover:bg-[var(--button-primary-hover)] border-2 border-[var(--button-primary-bg)] hover:border-[var(--button-primary-hover)]'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-gray-100'
                    }`}
                    style={{ outlineColor: 'var(--focus-ring)' }}
                    aria-label={
                      isVotingLocked
                        ? 'Röstning är låst'
                        : suggestion.hasVoted
                        ? 'Ta bort röst'
                        : 'Rösta på denna bok'
                    }
                    title={
                      isVotingLocked
                        ? 'Röstning är låst tills administratören startar en ny omgång'
                        : suggestion.hasVoted
                        ? 'Ta bort röst'
                        : 'Rösta på denna bok'
                    }
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
                  <div className="relative w-20 h-28 sm:w-24 sm:h-32 flex-shrink-0">
                    {suggestion.coverImage ? (
                      <Image
                        src={suggestion.coverImage}
                        alt={`Omslag för ${suggestion.title}`}
                        fill
                        sizes="(max-width: 640px) 80px, 96px"
                        className="object-cover rounded shadow-sm"
                      />
                    ) : (
                      <BookPlaceholder />
                    )}
                  </div>

                  {/* Book info */}
                  <div className="flex-1 min-w-0">
                    {/* Placement badge for winners */}
                    {suggestion.placement && (
                      <div className="mb-2">
                        <PlacementBadge placement={suggestion.placement} />
                      </div>
                    )}

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
                      <BookDescriptions
                        googleDescription={suggestion.googleDescription}
                        description={suggestion.description}
                        title={suggestion.title}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile only: descriptions below cover/title section */}
              <div className="sm:hidden mt-3">
                <BookDescriptions
                  googleDescription={suggestion.googleDescription}
                  description={suggestion.description}
                  title={suggestion.title}
                />
              </div>

              {/* Footer with metadata */}
              <div className="mt-3">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500">
                  <span>Föreslagen av {suggestion.suggestedBy.name}</span>
                  <StatusBadge status={suggestion.status} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
