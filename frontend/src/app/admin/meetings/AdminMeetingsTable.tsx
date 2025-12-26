'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { createMeeting, updateMeeting, deleteMeeting } from '@/app/meetings/actions';
import { ActionButton } from '@/components/ActionButton';
import { ConfirmModal } from '@/components/ConfirmModal';
import { useToast } from '@/components/Toast';

import { MeetingForm } from './MeetingForm';
import { MeetingMobileCard } from './MeetingMobileCard';
import { MeetingTableRow } from './MeetingTableRow';

import type { BookInfo, Meeting } from '@/types/meeting';

interface AdminMeetingsTableProps {
  meetings: Meeting[];
  currentBook?: BookInfo;
}

export function AdminMeetingsTable({ meetings, currentBook }: AdminMeetingsTableProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [showForm, setShowForm] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | undefined>(undefined);
  const [meetingToDelete, setMeetingToDelete] = useState<{
    id: string;
    mongoId: string;
    date: string;
  } | null>(null);

  const handleCreateNew = () => {
    setEditingMeeting(undefined);
    setShowForm(true);
  };

  const handleEdit = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingMeeting(undefined);
  };

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      let result;

      if (editingMeeting) {
        // Update existing meeting
        result = await updateMeeting(editingMeeting._id, formData);
      } else {
        // Create new meeting
        result = await createMeeting(formData);
      }

      if (result.success) {
        showToast(result.message || 'Möte sparat', 'success');
        setShowForm(false);
        setEditingMeeting(undefined);
        router.refresh();
      } else {
        showToast(result.error || 'Ett fel uppstod', 'error');
      }
    });
  };

  const handleDeleteConfirm = async () => {
    if (!meetingToDelete) return;

    startTransition(async () => {
      const result = await deleteMeeting(meetingToDelete.mongoId);

      if (result.success) {
        showToast(result.message || 'Möte borttaget', 'success');
        setMeetingToDelete(null);
        router.refresh();
      } else {
        showToast(result.error || 'Ett fel uppstod', 'error');
        setMeetingToDelete(null);
      }
    });
  };

  // Sort meetings by date (ascending)
  const sortedMeetings = [...meetings].sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : 0;
    const dateB = b.date ? new Date(b.date).getTime() : 0;
    return dateA - dateB;
  });

  return (
    <div>
      {/* Header with Create Button */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-sm text-gray-600">
            {meetings.length} {meetings.length === 1 ? 'möte' : 'möten'} totalt
          </p>
        </div>
        <ActionButton
          variant="success"
          onClick={handleCreateNew}
          disabled={isPending || showForm}
        >
          Skapa nytt möte
        </ActionButton>
      </div>

      {/* Meeting Form (shown when creating or editing) */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {editingMeeting ? 'Redigera möte' : 'Skapa nytt möte'}
          </h2>
          <MeetingForm
            key={editingMeeting?._id || 'new'}
            meeting={editingMeeting}
            currentBook={currentBook}
            onSubmit={handleSubmit}
            isPending={isPending}
            onCancel={handleCancelForm}
          />
        </div>
      )}

      {/* Meetings List */}
      {sortedMeetings.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">Inga möten skapade ännu.</p>
          <p className="text-sm text-gray-500 mt-2">
            Klicka på &quot;Skapa nytt möte&quot; för att komma igång.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          {/* Desktop Table - hidden on mobile */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Datum
                  </th>
                  <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tid
                  </th>
                  <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plats
                  </th>
                  <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bok
                  </th>
                  <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Åtgärder
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedMeetings.map((meeting) => (
                  <MeetingTableRow
                    key={meeting._id}
                    meeting={meeting}
                    isPending={isPending}
                    onEdit={handleEdit}
                    onDelete={(id, mongoId, date) =>
                      setMeetingToDelete({ id, mongoId, date })
                    }
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Layout - visible only on mobile */}
          <div className="md:hidden space-y-4 p-4">
            {sortedMeetings.map((meeting) => (
              <MeetingMobileCard
                key={meeting._id}
                meeting={meeting}
                isPending={isPending}
                onEdit={handleEdit}
                onDelete={(id, mongoId, date) =>
                  setMeetingToDelete({ id, mongoId, date })
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!meetingToDelete}
        onClose={() => setMeetingToDelete(null)}
        onConfirm={() => {
          void handleDeleteConfirm();
        }}
        title="Ta bort möte?"
        message={
          meetingToDelete
            ? `Är du säker på att du vill ta bort mötet ${meetingToDelete.date}? Denna åtgärd kan inte ångras.`
            : ''
        }
        confirmText="Ta bort"
        cancelText="Avbryt"
      />
    </div>
  );
}
