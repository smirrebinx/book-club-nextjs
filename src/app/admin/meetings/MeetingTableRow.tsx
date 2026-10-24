'use client';

import { ActionButton } from '@/components/ActionButton';

import type { Meeting } from '@/types/meeting';

interface MeetingTableRowProps {
  meeting: Meeting;
  isPending: boolean;
  onEdit: (meeting: Meeting) => void;
  onDelete: (meetingId: string, mongoId: string, meetingDate: string) => void;
}

export function MeetingTableRow({
  meeting,
  isPending,
  onEdit,
  onDelete,
}: MeetingTableRowProps) {
  // Format date to Swedish locale
  const formattedDate = meeting.date
    ? new Date(meeting.date).toLocaleDateString('sv-SE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Inget datum';

  return (
    <tr>
      <td className="px-2 sm:px-4 md:px-6 py-4">
        <div className="text-sm font-medium text-gray-900">{formattedDate}</div>
        <div className="text-xs text-[var(--color-muted)] mt-1">ID: {meeting.id || 'Inget ID'}</div>
      </td>
      <td className="px-2 sm:px-4 md:px-6 py-4 text-sm text-gray-500">
        {meeting.time || '-'}
      </td>
      <td className="px-2 sm:px-4 md:px-6 py-4 text-sm text-gray-500">
        {meeting.location || '-'}
      </td>
      <td className="px-2 sm:px-4 md:px-6 py-4">
        <div className="text-sm font-medium text-gray-900">{meeting.book?.title || 'Ingen bok vald'}</div>
        <div className="text-sm text-gray-500">{meeting.book?.author || '-'}</div>
      </td>
      <td className="px-2 sm:px-4 md:px-6 py-4 text-sm">
        <div className="flex flex-wrap gap-2">
          <ActionButton
            variant="success"
            size="sm"
            onClick={() => onEdit(meeting)}
            disabled={isPending}
          >
            Redigera
          </ActionButton>
          <ActionButton
            variant="danger"
            size="sm"
            onClick={() => onDelete(meeting.id || '', meeting._id, formattedDate)}
            disabled={isPending}
          >
            Ta bort
          </ActionButton>
        </div>
      </td>
    </tr>
  );
}
