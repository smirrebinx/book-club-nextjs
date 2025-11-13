'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { ActionLink } from '@/components/ActionButton';
import { ConfirmModal } from '@/components/ConfirmModal';
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
  coverImage?: string;
  isbn?: string;
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
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [suggestionToDelete, setSuggestionToDelete] = useState<{ id: string; title: string } | null>(null);

  const handleDeleteClick = (suggestionId: string, title: string) => {
    setSuggestionToDelete({ id: suggestionId, title });
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!suggestionToDelete) return;

    startTransition(async () => {
      const result = await deleteSuggestion(suggestionToDelete.id);
      if (result.success) {
        showToast('Förslag borttaget', 'success');
        router.refresh();
      } else {
        showToast(result.error || 'Ett fel uppstod', 'error');
      }
      setDeleteModalOpen(false);
      setSuggestionToDelete(null);
    });
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setSuggestionToDelete(null);
  };

  const canDelete = (suggestion: Suggestion) => {
    return userRole === 'admin' || suggestion.suggestedBy._id === currentUserId;
  };

  return (
    <div className="space-y-4">
      {suggestions.map((suggestion) => (
        <div key={suggestion._id} className="bg-white rounded-lg shadow p-6">
          <div className="flex gap-4 mb-4">
            {suggestion.coverImage && (
              <div className="relative w-24 h-32 flex-shrink-0">
                <Image
                  src={suggestion.coverImage}
                  alt={`Omslag för ${suggestion.title}`}
                  fill
                  sizes="96px"
                  className="object-cover rounded shadow-sm"
                />
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {suggestion.title}
              </h3>
              <p className="text-gray-600 mb-2">av {suggestion.author}</p>
              {suggestion.isbn && (
                <p className="text-xs text-gray-500 mb-2">ISBN: {suggestion.isbn}</p>
              )}
              <p className="text-gray-700">{suggestion.description}</p>
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
              <ActionLink
                variant="danger"
                onClick={() => handleDeleteClick(suggestion._id, suggestion.title)}
                disabled={isPending}
              >
                Ta bort
              </ActionLink>
            )}
          </div>
        </div>
      ))}

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={() => void handleConfirmDelete()}
        title="Ta bort bokförslag"
        message={suggestionToDelete ? `Är du säker på att du vill ta bort "${suggestionToDelete.title}"? Detta kan inte ångras.` : ''}
        confirmText="Ta bort"
        cancelText="Avbryt"
      />
    </div>
  );
}
