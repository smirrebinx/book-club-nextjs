'use client';

import Image from 'next/image';

import { ActionButton } from '@/components/ActionButton';

import type { SuggestionStatus } from '@/models/BookSuggestion';

interface Suggestion {
  _id: string;
  title: string;
  author: string;
  description: string;
  status: SuggestionStatus;
  voteCount: number;
  suggestedBy: {
    name: string;
    email: string;
  };
  createdAt: string;
  coverImage?: string;
  isbn?: string;
}

interface SuggestionMobileCardProps {
  suggestion: Suggestion;
  isPending: boolean;
  onStatusChange: (id: string, status: SuggestionStatus) => void;
  onDelete: (id: string) => void;
}

export function SuggestionMobileCard({
  suggestion,
  isPending,
  onStatusChange,
  onDelete,
}: SuggestionMobileCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      {/* Book Info with Cover */}
      <div className="mb-3">
        <div className="text-xs font-medium text-gray-500 uppercase mb-2">Bok</div>
        <div className="flex gap-3">
          {suggestion.coverImage && (
            <div className="relative w-16 h-20 flex-shrink-0">
              <Image
                src={suggestion.coverImage}
                alt={`Omslag för ${suggestion.title}`}
                fill
                sizes="64px"
                className="object-cover rounded shadow-sm"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900">{suggestion.title}</div>
            <div className="text-sm text-gray-500">{suggestion.author}</div>
            {suggestion.isbn && (
              <div className="text-xs text-gray-400 mt-1">ISBN: {suggestion.isbn}</div>
            )}
          </div>
        </div>
      </div>

      {/* Suggested By */}
      <div className="mb-3">
        <div className="text-xs font-medium text-gray-500 uppercase mb-1">Föreslagen av</div>
        <div className="text-sm text-gray-500">{suggestion.suggestedBy.name}</div>
      </div>

      {/* Vote Count */}
      <div className="mb-3">
        <div className="text-xs font-medium text-gray-500 uppercase mb-1">Röster</div>
        <div className="text-sm text-gray-500">{suggestion.voteCount}</div>
      </div>

      {/* Status */}
      <div className="mb-3">
        <label htmlFor={`status-mobile-${suggestion._id}`} className="text-xs font-medium text-gray-500 uppercase mb-1 block">
          Status
        </label>
        <select
          id={`status-mobile-${suggestion._id}`}
          value={suggestion.status}
          onChange={(e) => onStatusChange(suggestion._id, e.target.value as SuggestionStatus)}
          disabled={isPending}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-[var(--focus-border)] focus:outline-none"
          style={{ "--tw-ring-color": "var(--focus-ring)" } as React.CSSProperties}
        >
          <option value="pending">Väntande</option>
          <option value="currently_reading">Läser nu</option>
        </select>
      </div>

      {/* Actions */}
      <div>
        <div className="text-xs font-medium text-gray-500 uppercase mb-2">Åtgärder</div>
        <ActionButton
          variant="danger"
          onClick={() => onDelete(suggestion._id)}
          disabled={isPending}
          fullWidth
        >
          Ta bort förslag
        </ActionButton>
      </div>
    </div>
  );
}
