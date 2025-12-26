'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

import { updateSuggestionStatus, deleteSuggestionAsAdmin } from '@/app/admin/actions';
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

  const handleDelete = async (id: string) => {
    if (!confirm('Är du säker på att du vill ta bort detta förslag?')) return;

    startTransition(async () => {
      const result = await deleteSuggestionAsAdmin(id);
      if (result.success) {
        showToast('Förslag borttaget', 'success');
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
                  void handleDelete(id);
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
              void handleDelete(id);
            }}
          />
        ))}
      </div>
    </div>
  );
}
