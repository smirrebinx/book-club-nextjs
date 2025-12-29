'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition, useRef, useEffect } from 'react';

import { finalizeWinners } from '@/app/admin/actions';
import { useToast } from '@/components/Toast';

interface BookCandidate {
  _id: string;
  title: string;
  author: string;
  voteCount: number;
}

interface MeetingInfo {
  _id: string;
  date: string;
  time: string;
  location: string;
}

interface WinnerInfo {
  title: string;
  author: string;
  placement: 1 | 2 | 3;
  votes: number;
  meeting: string;
}

interface FinalizeWinnersButtonProps {
  topCandidates: BookCandidate[];
  availableMeetings: MeetingInfo[];
  isFinalized: boolean;
  finalizedRound?: {
    roundNumber: number;
    finalizedAt: string;
    winners: WinnerInfo[];
  };
}

export function FinalizeWinnersButton({
  topCandidates,
  availableMeetings,
  isFinalized,
  finalizedRound,
}: FinalizeWinnersButtonProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Focus management: Move focus to dialog when opened
  useEffect(() => {
    if (showConfirmDialog && dialogRef.current) {
      dialogRef.current.focus();
    }
  }, [showConfirmDialog]);

  // Escape key handler: Close dialog on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showConfirmDialog) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showConfirmDialog]);

  const handleClose = () => {
    setShowConfirmDialog(false);
    // Return focus to trigger button
    triggerRef.current?.focus();
  };

  const handleFinalize = () => {
    startTransition(async () => {
      const result = await finalizeWinners();
      if (result.success) {
        showToast(result.message || 'Vinnare finaliserade', 'success');

        // Show warnings if any
        if (result.warnings && result.warnings.length > 0) {
          result.warnings.forEach(warning => {
            showToast(warning, 'warning');
          });
        }

        handleClose();
        router.refresh();
      } else {
        showToast(result.error || 'Ett fel uppstod', 'error');
      }
    });
  };

  const getPlacementBadge = (placement: 1 | 2 | 3) => {
    const labels = {
      1: 'Första plats',
      2: 'Andra plats',
      3: 'Tredje plats'
    };
    const emojis = { 1: '🥇', 2: '🥈', 3: '🥉' };

    return <span className="text-xl mr-1" aria-label={labels[placement]}>{emojis[placement]}</span>;
  };

  // Show locked state if voting is already finalized
  if (isFinalized && finalizedRound) {
    return (
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden="true">🔒</span>
          <h2 className="text-lg font-bold text-gray-900">
            Röstning är låst - Omgång #{finalizedRound.roundNumber}
          </h2>
        </div>

        <p className="text-sm text-gray-600">
          Finaliserad: {new Date(finalizedRound.finalizedAt).toLocaleString('sv-SE')}
        </p>

        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">Vinnare:</h3>
          {finalizedRound.winners.map((winner, idx) => (
            <div
              key={idx}
              className="bg-white rounded-md p-4 border border-gray-200"
            >
              <div className="flex items-start gap-2">
                {getPlacementBadge(winner.placement)}
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{winner.title}</p>
                  <p className="text-sm text-gray-600">av {winner.author}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {winner.votes} röster • {winner.meeting}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-sm text-gray-600 mt-4">
          Använd &quot;Återställ röstning&quot; knappen för att starta en ny omgång.
        </p>
      </div>
    );
  }

  // Check if we have enough data to finalize
  const canFinalize = topCandidates.length > 0 && availableMeetings.length > 0;

  if (!canFinalize) {
    return (
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-gray-700">
          {topCandidates.length === 0
            ? 'Inga böcker har fått röster ännu. Vänta tills medlemmar har röstat.'
            : 'Inga framtida möten finns. Skapa minst 1 möte innan du finaliserar vinnare.'}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-900">
          Redo att slutföra bokomröstning
        </h2>

        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">
            Topp {topCandidates.length} kandidater:
          </h3>
          {topCandidates.slice(0, 3).map((book, idx) => (
            <div
              key={book._id}
              className="bg-white rounded-md p-3 border border-gray-200"
            >
              <div className="flex items-start gap-2">
                {getPlacementBadge((idx + 1) as 1 | 2 | 3)}
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{book.title}</p>
                  <p className="text-sm text-gray-600">av {book.author}</p>
                  <p className="text-sm text-gray-500">
                    {book.voteCount} {book.voteCount === 1 ? 'röst' : 'röster'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-gray-900">
            Tillgängliga möten ({availableMeetings.length}):
          </h3>
          {availableMeetings.slice(0, 3).map((meeting, idx) => (
            <div key={meeting._id} className="text-sm text-gray-600">
              {getPlacementBadge((idx + 1) as 1 | 2 | 3)}
              {new Date(meeting.date).toLocaleDateString('sv-SE')} kl {meeting.time} - {meeting.location}
            </div>
          ))}
        </div>

        <button
          ref={triggerRef}
          onClick={() => setShowConfirmDialog(true)}
          disabled={isPending}
          className="btn-primary w-full px-4 py-3 font-semibold"
        >
          Slutför bokomröstning och tilldela till möten
        </button>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="finalize-dialog-title"
        >
          <div
            ref={dialogRef}
            tabIndex={-1}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
          >
            <h2 id="finalize-dialog-title" className="text-xl font-bold text-gray-900 mb-4">
              Bekräfta finalisering av vinnare
            </h2>

            <div className="text-sm text-gray-600 mb-6 space-y-4">
              <p>Detta kommer att:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Välja de 3 böckerna med flest röster som vinnare</li>
                <li>Tilldela böckerna till de nästa 3 kommande mötena automatiskt</li>
                <li>Låsa röstningen (inga fler röster kan läggas till)</li>
                <li>Skapa en ny röstningsomgång (Omgång #1)</li>
              </ul>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mt-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Förhandsvisning av tilldelning:
                </h3>
                {topCandidates.slice(0, 3).map((book, idx) => {
                  const meeting = availableMeetings[idx];
                  return (
                    <div key={book._id} className="text-sm text-gray-700 mb-2">
                      {getPlacementBadge((idx + 1) as 1 | 2 | 3)}
                      <strong>{book.title}</strong>
                      {meeting ? (
                        <span className="text-gray-600">
                          {' '}→ {new Date(meeting.date).toLocaleDateString('sv-SE')} kl {meeting.time}
                        </span>
                      ) : (
                        <span className="text-orange-600"> → Inget möte tilldelat</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {availableMeetings.length < 3 && (
                <p className="mt-4 text-orange-600 font-semibold">
                  <span aria-hidden="true">⚠️</span> Observera: Endast {availableMeetings.length} {availableMeetings.length === 1 ? 'möte' : 'möten'} tillgängligt.
                  {3 - availableMeetings.length} {3 - availableMeetings.length === 1 ? 'bok' : 'böcker'} kommer inte att tilldelas ett möte.
                </p>
              )}

              <p className="mt-4 font-semibold text-red-600">
                Detta kan inte ångras! (Du kan dock återställa röstningen efter finalisering)
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleClose}
                disabled={isPending}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-2 focus:outline-offset-2 transition-colors"
                style={{ outlineColor: 'var(--focus-ring)' }}
              >
                Avbryt
              </button>
              <button
                onClick={handleFinalize}
                disabled={isPending}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-2 focus:outline-offset-2 transition-colors"
                style={{ outlineColor: 'var(--focus-ring)' }}
              >
                {isPending ? 'Finaliserar...' : 'Finalisera vinnare'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
