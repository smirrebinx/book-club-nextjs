'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition, useRef, useEffect } from 'react';

import { resetVotingCycle } from '@/app/admin/actions';
import { useToast } from '@/components/Toast';

interface ResetVotingButtonProps {
  hasActiveVotingCycle: boolean;
}

export function ResetVotingButton({ hasActiveVotingCycle }: ResetVotingButtonProps) {
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

  const handleReset = () => {
    startTransition(async () => {
      const result = await resetVotingCycle();
      if (result.success) {
        showToast(result.message || 'Röstningsomgång återställd', 'success');
        handleClose();
        router.refresh();
      } else {
        showToast(result.error || 'Ett fel uppstod', 'error');
      }
    });
  };

  if (!hasActiveVotingCycle) {
    return null;
  }

  return (
    <>
      <button
        ref={triggerRef}
        onClick={() => setShowConfirmDialog(true)}
        disabled={isPending}
        className="px-4 py-2 bg-[var(--action-warning-bg)] text-white rounded-md hover:bg-[var(--action-warning-bg-hover)] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-2 focus:outline-offset-2 transition-colors whitespace-nowrap"
        style={{ outlineColor: 'var(--focus-ring)' }}
      >
        Återställ röstning
      </button>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-dialog-title"
        >
          <div
            ref={dialogRef}
            tabIndex={-1}
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
          >
            <h2 id="reset-dialog-title" className="text-xl font-bold text-gray-900 mb-4">
              Återställ röstningsomgång
            </h2>
            <div className="text-sm text-gray-600 mb-6 space-y-2">
              <p>Detta kommer att:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Flytta alla 3 vinnare till &quot;Läst&quot;</li>
                <li>Avsluta nuvarande röstningsomgång</li>
                <li>Rensa alla röster från alla böcker</li>
                <li>Starta en ny röstningsomgång</li>
                <li>Låsa upp röstningen för medlemmar</li>
              </ul>
              <p className="mt-4 font-semibold" style={{ color: 'var(--action-warning)' }}>
                Detta kan inte ångras!
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
                onClick={handleReset}
                disabled={isPending}
                className="flex-1 px-4 py-2 bg-[var(--action-warning-bg)] text-white rounded-md hover:bg-[var(--action-warning-bg-hover)] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-2 focus:outline-offset-2 transition-colors"
                style={{ outlineColor: 'var(--focus-ring)' }}
              >
                {isPending ? 'Återställer...' : 'Återställ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
