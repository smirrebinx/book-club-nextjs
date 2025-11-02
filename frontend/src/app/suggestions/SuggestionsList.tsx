'use client';

import { useRouter } from 'next/navigation';
import { useOptimistic, useTransition } from 'react';

import { useToast } from '@/components/Toast';

import { toggleVote, deleteSuggestion } from './actions';


import type { SuggestionStatus } from '@/models/BookSuggestion';
import type { UserRole } from '@/models/User';

interface Suggestion {
  _id: string;
  title: string;
  author: string;
  description: string;
  status: SuggestionStatus;
  votes: string[];
  voteCount: number;
  hasVoted: boolean;
  suggestedBy: {
    _id?: string;
    name: string;
  };
  createdAt: string;
}

export function SuggestionsList({
  suggestions,
  currentUserId,
  userRole,
}: {
  suggestions: Suggestion[];
  currentUserId: string;
  userRole: UserRole;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [optimisticSuggestions, setOptimisticSuggestions] = useOptimistic(suggestions);

  const handleVote = async (suggestionId: string) => {
    const suggestion = suggestions.find((s) => s._id === suggestionId);
    if (!suggestion) return;

    // Optimistic update
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

    startTransition(async () => {
      const result = await toggleVote(suggestionId);
      if (result.success) {
        showToast(result.message || 'Röst registrerad', 'success');
        router.refresh();
      } else {
        showToast(result.error || 'Ett fel uppstod', 'error');
        // Revert optimistic update on error
        router.refresh();
      }
    });
  };

  const handleDelete = async (suggestionId: string) => {
    if (!confirm('Är du säker på att du vill ta bort detta förslag?')) return;

    startTransition(async () => {
      const result = await deleteSuggestion(suggestionId);
      if (result.success) {
        showToast('Förslag borttaget', 'success');
        router.refresh();
      } else {
        showToast(result.error || 'Ett fel uppstod', 'error');
      }
    });
  };

  const canDelete = (suggestion: Suggestion) => {
    return userRole === 'admin' || suggestion.suggestedBy._id === currentUserId;
  };

  return (
    <div className="space-y-4">
      {optimisticSuggestions.map((suggestion) => (
        <div key={suggestion._id} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {suggestion.title}
              </h3>
              <p className="text-gray-600 mb-2">av {suggestion.author}</p>
              <p className="text-gray-700">{suggestion.description}</p>
            </div>

            <div className="ml-4 text-center">
              <button
                onClick={() => void handleVote(suggestion._id)}
                disabled={isPending}
                className={`flex flex-col items-center p-3 rounded-lg transition-colors ${
                  suggestion.hasVoted
                    ? 'bg-[#94b1aa] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } disabled:opacity-50`}
              >
                <svg
                  className="w-6 h-6 mb-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                </svg>
                <span className="text-sm font-semibold">{suggestion.voteCount}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-4">
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

            {canDelete(suggestion) && (
              <button
                onClick={() => void handleDelete(suggestion._id)}
                disabled={isPending}
                className="text-red-600 hover:text-red-900 disabled:opacity-50"
              >
                Ta bort
              </button>
            )}
          </div>
        </div>
      ))}

      {optimisticSuggestions.length === 0 && (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          Inga bokförslag ännu. Var först med att lägga till ett!
        </div>
      )}
    </div>
  );
}
