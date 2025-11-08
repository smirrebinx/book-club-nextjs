'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

import { updateSuggestionStatus, deleteSuggestionAsAdmin } from '@/app/admin/actions';
import { useToast } from '@/components/Toast';

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
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
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
              <tr key={s._id}>
                <td className="px-2 md:px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{s.title}</div>
                  <div className="text-sm text-gray-500">{s.author}</div>
                </td>
                <td className="px-2 md:px-6 py-4 text-sm text-gray-500">{s.suggestedBy.name}</td>
                <td className="px-2 md:px-6 py-4 text-sm text-gray-500">{s.voteCount}</td>
                <td className="px-2 md:px-6 py-4">
                <select
                  value={s.status}
                  onChange={(e) => void handleStatusChange(s._id, e.target.value as SuggestionStatus)}
                  disabled={isPending}
                  className="px-3 py-1 border rounded-md text-sm"
                >
                  <option value="pending">Väntande</option>
                  <option value="approved">Godkänd</option>
                  <option value="currently_reading">Läser nu</option>
                  <option value="rejected">Avvisad</option>
                </select>
              </td>
              <td className="px-2 md:px-6 py-4">
                <button
                  onClick={() => void handleDelete(s._id)}
                  disabled={isPending}
                  className="text-red-600 hover:text-red-900 text-sm font-medium disabled:opacity-50"
                >
                  Ta bort
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>
    </div>
  );
}
