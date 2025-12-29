'use client';

import { useRouter } from 'next/navigation';
import { useTransition, useState } from 'react';

import { updateSuggestionStatus, deleteSuggestionAsAdmin } from '@/app/admin/actions';
import { ConfirmModal } from '@/components/ConfirmModal';
import { useToast } from '@/components/Toast';

import { SuggestionMobileCard } from './SuggestionMobileCard';
import { SuggestionTableRow } from './SuggestionTableRow';

import type { SuggestionStatus } from '@/models/BookSuggestion';

interface Suggestion {
  _id: string;
  title: string;
  author: string;
  description: string;
  status: SuggestionStatus;
  voteCount: number;
  placement?: 1 | 2 | 3;
  votingRound?: string;
  suggestedBy: {
    name: string;
    email: string;
  };
  createdAt: string;
}

export function AdminSuggestionsTable({ suggestions }: { suggestions: Suggestion[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string | null; title: string }>({
    isOpen: false,
    id: null,
    title: ''
  });

  const handleStatusChange = async (id: string, status: SuggestionStatus) => {
    startTransition(async () => {
      const result = await updateSuggestionStatus(id, status);
      if (result.success) {
        showToast('Status uppdaterad', 'success');
        router.refresh();
      } else {
        showToast(result.error || 'Ett fel uppstod', 'error');
      }
    });
  };

  const handleDelete = (id: string, title: string) => {
    setDeleteConfirm({ isOpen: true, id, title });
  };

  const confirmDelete = async () => {
    const id = deleteConfirm.id;
    if (!id) return;

    startTransition(async () => {
      const result = await deleteSuggestionAsAdmin(id);
      if (result.success) {
        showToast('Förslag borttaget', 'success');
        setDeleteConfirm({ isOpen: false, id: null, title: '' });
        router.refresh();
      } else {
        showToast(result.error || 'Ett fel uppstod', 'error');
      }
    });
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Desktop Table - hidden on mobile */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <caption className="sr-only">Bokförslag med status och röstresultat</caption>
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bok</th>
              <th className="px-2 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Föreslagen av</th>
              <th className="px-2 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Röster</th>
              <th className="px-2 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-2 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Åtgärder</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {suggestions.map((s) => (
              <SuggestionTableRow
                key={s._id}
                suggestion={s}
                isPending={isPending}
                onStatusChange={(id, status) => {
                  void handleStatusChange(id, status);
                }}
                onDelete={(id) => {
                  handleDelete(id, s.title);
                }}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout - visible only on mobile */}
      <div className="md:hidden space-y-4 p-4">
        {suggestions.map((s) => (
          <SuggestionMobileCard
            key={s._id}
            suggestion={s}
            isPending={isPending}
            onStatusChange={(id, status) => {
              void handleStatusChange(id, status);
            }}
            onDelete={(id) => {
              handleDelete(id, s.title);
            }}
          />
        ))}
      </div>

      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null, title: '' })}
        onConfirm={() => { void confirmDelete(); }}
        title="Ta bort bokförslag"
        message={`Är du säker på att du vill ta bort "${deleteConfirm.title}"? Detta kan inte ångras.`}
        confirmText="Ta bort"
        cancelText="Avbryt"
      />
    </div>
  );
}
