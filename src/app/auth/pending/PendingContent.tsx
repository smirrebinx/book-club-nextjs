'use client';

import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/Button';

interface PendingContentProps {
  email: string;
}

export function PendingContent({ email }: PendingContentProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(false);
  const [message, setMessage] = useState('');

  // Auto-check every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [router]);

  const handleCheckStatus = async () => {
    setIsChecking(true);
    setMessage('Kontrollerar status...');

    // Refresh the page to check if user has been approved
    router.refresh();

    setTimeout(() => {
      setIsChecking(false);
      setMessage('Status kontrollerad. Om du fortfarande ser denna sida har du inte blivit godkänd än.');
      // Clear message after 5 seconds
      setTimeout(() => setMessage(''), 5000);
    }, 1000);
  };

  const handleSignOut = () => {
    void signOut({ callbackUrl: '/auth/signin' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <svg
            className="mx-auto h-16 w-16 text-yellow-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Ditt konto väntar på godkännande
        </h1>

        <p className="text-gray-600 mb-4">
          Ditt konto med e-postadressen <strong>{email}</strong> är registrerat
          men väntar på godkännande från en administratör.
        </p>

        <p className="text-gray-500 text-sm mb-6">
          Du kommer automatiskt att få tillgång till webbplatsen så snart en administratör har
          godkänt din begäran. Denna sida kontrollerar automatiskt var 30:e sekund.
        </p>

        {/* Status message - uses CSS variables */}
        {message && (
          <div
            className="mb-6 p-3 rounded-lg"
            style={{
              backgroundColor: 'var(--background)',
              borderColor: 'var(--secondary-border)',
              borderWidth: '1px',
              borderStyle: 'solid',
            }}
            role="status"
            aria-live="polite"
          >
            <p className="text-sm" style={{ color: 'var(--secondary-text)' }}>
              {message}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <Button
            onClick={() => {
              void handleCheckStatus();
            }}
            disabled={isChecking}
            variant="secondary"
            size="lg"
            fullWidth
          >
            {isChecking ? 'Kontrollerar...' : 'Kontrollera status nu'}
          </Button>

          <Button
            onClick={handleSignOut}
            variant="outline"
            size="lg"
            fullWidth
          >
            Logga ut
          </Button>
        </div>

        <p className="text-xs text-gray-400 mt-6">
          Sidan uppdateras automatiskt var 30:e sekund
        </p>
      </div>
    </div>
  );
}
