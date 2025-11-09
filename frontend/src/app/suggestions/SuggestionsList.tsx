'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

import { ActionLink } from '@/components/ActionButton';
import { useToast } from '@/components/Toast';

import { deleteSuggestion } from './actions';


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
      {suggestions.map((suggestion) => (
        <div key={suggestion._id} className="bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              {suggestion.title}
            </h3>
            <p className="text-gray-600 mb-2">av {suggestion.author}</p>
            <p className="text-gray-700">{suggestion.description}</p>
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
              <ActionLink
                variant="danger"
                onClick={() => void handleDelete(suggestion._id)}
                disabled={isPending}
              >
                Ta bort
              </ActionLink>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
