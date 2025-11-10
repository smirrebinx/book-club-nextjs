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

interface SuggestionTableRowProps {
  suggestion: Suggestion;
  isPending: boolean;
  onStatusChange: (id: string, status: SuggestionStatus) => void;
  onDelete: (id: string) => void;
}

export function SuggestionTableRow({
  suggestion,
  isPending,
  onStatusChange,
  onDelete,
}: SuggestionTableRowProps) {
  return (
    <tr>
      <td className="px-2 md:px-6 py-4">
        <div className="flex gap-3 items-center">
          {suggestion.coverImage && (
            <div className="relative w-10 h-14 flex-shrink-0">
              <Image
                src={suggestion.coverImage}
                alt=""
                fill
                sizes="40px"
                className="object-cover rounded"
              />
            </div>
          )}
          <div>
            <div className="text-sm font-medium text-gray-900">{suggestion.title}</div>
            <div className="text-sm text-gray-500">{suggestion.author}</div>
            {suggestion.isbn && (
              <div className="text-xs text-gray-400 mt-1">ISBN: {suggestion.isbn}</div>
            )}
          </div>
        </div>
      </td>
      <td className="px-2 md:px-6 py-4 text-sm text-gray-500">{suggestion.suggestedBy.name}</td>
      <td className="px-2 md:px-6 py-4 text-sm text-gray-500">{suggestion.voteCount}</td>
      <td className="px-2 md:px-6 py-4">
        <label htmlFor={`status-${suggestion._id}`} className="sr-only">
          Ändra status för {suggestion.title}
        </label>
        <select
          id={`status-${suggestion._id}`}
          value={suggestion.status}
          onChange={(e) => onStatusChange(suggestion._id, e.target.value as SuggestionStatus)}
          disabled={isPending}
          className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:border-[var(--focus-border)] focus:outline-none"
          style={{ outlineColor: 'var(--focus-ring)' } as React.CSSProperties}
        >
          <option value="pending">Väntande</option>
          <option value="currently_reading">Läser nu</option>
        </select>
      </td>
      <td className="px-2 md:px-6 py-4">
        <ActionButton
          variant="danger"
          size="sm"
          onClick={() => onDelete(suggestion._id)}
          disabled={isPending}
        >
          Ta bort
        </ActionButton>
      </td>
    </tr>
  );
}
