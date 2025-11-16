'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { ActionLink } from '@/components/ActionButton';
import { BookPlaceholder } from '@/components/BookPlaceholder';
import { ConfirmModal } from '@/components/ConfirmModal';
import { useToast } from '@/components/Toast';

import { deleteSuggestion, updateSuggestion } from './actions';

function ExpandableDescription({ description, bookTitle }: { description: string; bookTitle: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = description.length > 200;

  return (
    <div>
      <p className={`text-sm text-gray-700 ${!isExpanded && shouldTruncate ? 'line-clamp-3' : ''}`}>
        {description}
      </p>
      {shouldTruncate && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-[var(--link-color)] hover:text-[var(--link-hover)] hover:underline mt-1 focus:outline-2 focus:outline-offset-2"
          style={{ outlineColor: 'var(--focus-ring)' }}
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

interface MotivationSectionProps {
  description: string;
  isEditing: boolean;
  editDescription: string;
  isPending: boolean;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onDescriptionChange: (value: string) => void;
}

function MotivationSection({
  description,
  isEditing,
  editDescription,
  isPending,
  onCancelEdit,
  onSaveEdit,
  onDescriptionChange,
}: MotivationSectionProps) {
  if (!description) return null;

  return (
    <div>
      <p className="text-sm font-semibold text-gray-800 mb-1">Motivering:</p>
      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={editDescription}
            onChange={(e) => onDescriptionChange(e.target.value)}
            maxLength={1000}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-[var(--focus-border)] focus:outline-none resize-none text-sm"
            style={{ '--tw-ring-color': 'var(--focus-ring)' } as React.CSSProperties}
            disabled={isPending}
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              {editDescription.length}/1000 tecken
            </p>
            <div className="flex gap-2">
              <button
                onClick={onCancelEdit}
                disabled={isPending}
                className="px-3 py-1.5 text-xs font-medium rounded-md border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 focus:outline-2 focus:outline-offset-2"
                style={{ outlineColor: 'var(--focus-ring)' }}
              >
                Avbryt
              </button>
              <button
                onClick={onSaveEdit}
                disabled={isPending}
                className="px-3 py-1.5 text-xs font-medium rounded-md bg-[var(--button-primary-bg)] text-[var(--button-primary-text)] hover:bg-[var(--button-primary-hover)] border-2 border-[var(--button-primary-bg)] hover:border-[var(--button-primary-hover)] disabled:opacity-50 focus:outline-2 focus:outline-offset-2"
                style={{ outlineColor: 'var(--focus-ring)' }}
              >
                {isPending ? 'Sparar...' : 'Spara'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-700">{description}</p>
      )}
    </div>
  );
}


import type { SuggestionStatus } from '@/models/BookSuggestion';
import type { UserRole } from '@/models/User';

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDescription, setEditDescription] = useState('');

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

  const handleEditClick = (suggestionId: string, currentDescription: string) => {
    setEditingId(suggestionId);
    setEditDescription(currentDescription);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditDescription('');
  };

  const handleSaveEdit = async (suggestionId: string) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('description', editDescription);

      const result = await updateSuggestion(suggestionId, formData);
      if (result.success) {
        showToast('Motivation uppdaterad', 'success');
        setEditingId(null);
        setEditDescription('');
        router.refresh();
      } else {
        showToast(result.error || 'Ett fel uppstod', 'error');
      }
    });
  };

  const canEdit = (suggestion: Suggestion) => {
    return userRole === 'admin' || suggestion.suggestedBy._id === currentUserId;
  };

  const canDelete = (suggestion: Suggestion) => {
    return userRole === 'admin' || suggestion.suggestedBy._id === currentUserId;
  };

  return (
    <div className="space-y-4">
      {suggestions.map((suggestion) => (
        <div key={suggestion._id} className="bg-white rounded-lg shadow p-6">
          {/* Desktop: side-by-side, Mobile: stacked */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            {/* Cover and basic info wrapper - side by side on all screens */}
            <div className="flex gap-4 sm:flex-1">
              <div className="relative w-24 h-32 flex-shrink-0">
                {suggestion.coverImage ? (
                  <Image
                    src={suggestion.coverImage}
                    alt={`Omslag för ${suggestion.title}`}
                    fill
                    sizes="96px"
                    className="object-cover rounded shadow-sm"
                  />
                ) : (
                  <BookPlaceholder />
                )}
              </div>
              <div className="flex-1 sm:flex-initial">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {suggestion.title}
                </h3>
                <p className="text-gray-600 mb-2">av {suggestion.author}</p>
                {suggestion.isbn && (
                  <p className="text-xs text-gray-500 mb-2">ISBN: {suggestion.isbn}</p>
                )}
                {/* On larger screens, show descriptions here */}
                <div className="hidden sm:block">
                  {suggestion.googleDescription && (
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-gray-800 mb-1">Om boken:</p>
                      <ExpandableDescription
                        description={suggestion.googleDescription}
                        bookTitle={suggestion.title}
                      />
                    </div>
                  )}

                  <MotivationSection
                    description={suggestion.description}
                    isEditing={editingId === suggestion._id}
                    editDescription={editDescription}
                    isPending={isPending}
                    onCancelEdit={handleCancelEdit}
                    onSaveEdit={() => void handleSaveEdit(suggestion._id)}
                    onDescriptionChange={setEditDescription}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Mobile only: descriptions below the cover/title section */}
          <div className="sm:hidden">
            {suggestion.googleDescription && (
              <div className="mb-3">
                <p className="text-sm font-semibold text-gray-800 mb-1">Om boken:</p>
                <ExpandableDescription
                  description={suggestion.googleDescription}
                  bookTitle={suggestion.title}
                />
              </div>
            )}

            <div className="mb-3">
              <MotivationSection
                description={suggestion.description}
                isEditing={editingId === suggestion._id}
                editDescription={editDescription}
                isPending={isPending}
                onCancelEdit={handleCancelEdit}
                onSaveEdit={() => void handleSaveEdit(suggestion._id)}
                onDescriptionChange={setEditDescription}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-4">
              <span>Föreslagen av {suggestion.suggestedBy.name}</span>
              <StatusBadge status={suggestion.status} />
            </div>

            <div className="flex items-center gap-3">
              {canEdit(suggestion) && suggestion.description && (
                <button
                  onClick={() => handleEditClick(suggestion._id, suggestion.description)}
                  disabled={isPending || editingId === suggestion._id}
                  className="font-medium text-[var(--link-color)] hover:text-[var(--link-hover)] transition-colors duration-300 focus:outline-2 focus:outline-offset-2 disabled:opacity-50"
                  style={{ outlineColor: 'var(--focus-ring)' }}
                >
                  Redigera
                </button>
              )}
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
