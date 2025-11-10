'use client';

import { ActionButton } from '@/components/ActionButton';

import type { Meeting } from '@/types/meeting';

interface MeetingMobileCardProps {
  meeting: Meeting;
  isPending: boolean;
  onEdit: (meeting: Meeting) => void;
  onDelete: (meetingId: string, mongoId: string, meetingDate: string) => void;
}

export function MeetingMobileCard({
  meeting,
  isPending,
  onEdit,
  onDelete,
}: MeetingMobileCardProps) {
  // Format date to Swedish locale
  const formattedDate = new Date(meeting.date).toLocaleDateString('sv-SE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      {/* Meeting Date */}
      <div className="mb-3">
        <div className="text-xs font-medium text-gray-500 uppercase mb-1">Datum</div>
        <div className="text-sm font-medium text-gray-900">{formattedDate}</div>
        <div className="text-xs text-[var(--color-muted)] mt-1">ID: {meeting.id}</div>
      </div>

      {/* Time */}
      <div className="mb-3">
        <div className="text-xs font-medium text-gray-500 uppercase mb-1">Tid</div>
        <div className="text-sm text-gray-500">{meeting.time}</div>
      </div>

      {/* Location */}
      <div className="mb-3">
        <div className="text-xs font-medium text-gray-500 uppercase mb-1">Plats</div>
        <div className="text-sm text-gray-500">{meeting.location}</div>
      </div>

      {/* Book Info */}
      <div className="mb-3 pb-3 border-b border-gray-200">
        <div className="text-xs font-medium text-gray-500 uppercase mb-1">Bok</div>
        <div className="text-sm font-medium text-gray-900">{meeting.book.title}</div>
        <div className="text-sm text-gray-500">av {meeting.book.author}</div>
      </div>

      {/* Additional Info (if exists) */}
      {meeting.additionalInfo && (
        <div className="mb-3">
          <div className="text-xs font-medium text-gray-500 uppercase mb-1">Information</div>
          <div className="text-sm text-gray-500">{meeting.additionalInfo}</div>
        </div>
      )}

      {/* Actions */}
      <div>
        <div className="text-xs font-medium text-gray-500 uppercase mb-2">Åtgärder</div>
        <div className="flex flex-col gap-2">
          <ActionButton
            variant="success"
            onClick={() => onEdit(meeting)}
            disabled={isPending}
            fullWidth
          >
            Redigera möte
          </ActionButton>
          <ActionButton
            variant="danger"
            onClick={() => onDelete(meeting.id, meeting._id, formattedDate)}
            disabled={isPending}
            fullWidth
          >
            Ta bort möte
          </ActionButton>
        </div>
      </div>
    </div>
  );
}
