'use client';

import Link from 'next/link';
import { useEffect } from 'react';

import LottieAnimation from '@/components/LottieAnimation';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{
        backgroundColor: 'var(--background)',
        color: 'var(--secondary-text)',
      }}
    >
      <div className="flex w-full max-w-2xl flex-col items-center gap-6 text-center">
        {/* Error Animation */}
        <LottieAnimation
          src="/animations/Error.lottie"
          width={250}
          height={250}
          ariaLabel="Fel-animation"
          isDecorative={false}
        />

        {/* Heading */}
        <h1
          className="text-4xl font-bold tracking-wide"
          style={{
            fontFamily: 'var(--font-heading)',
            color: 'var(--primary-text)',
          }}
        >
          Något gick fel
        </h1>

        {/* Description */}
        <p
          className="max-w-md text-lg leading-8"
          style={{
            fontFamily: 'var(--font-body)',
            color: 'var(--secondary-text)',
          }}
        >
          Ett oväntat fel inträffade när sidan skulle laddas. Vänligen försök igen om en stund.
        </p>

        {/* Error Details (only in development) */}
        {process.env.NODE_ENV === 'development' && error.message && (
          <details className="mt-4 w-full max-w-md">
            <summary
              className="cursor-pointer text-sm font-semibold hover:underline focus:outline-2 focus:outline-offset-2"
              style={{
                fontFamily: 'var(--font-body)',
                color: 'var(--primary-text)',
                outlineColor: 'var(--focus-ring)',
              }}
            >
              Teknisk information
            </summary>
            <p
              className="mt-2 rounded-lg bg-gray-100 p-4 text-left text-sm font-mono text-gray-800"
              style={{ wordBreak: 'break-word' }}
            >
              {error.message}
            </p>
          </details>
        )}

        {/* Action Buttons */}
        <div className="mt-4 flex flex-col sm:flex-row gap-4">
          <button
            onClick={reset}
            className="rounded-lg px-6 py-3 text-lg font-semibold transition-all duration-300 hover:opacity-90 focus:outline-2 focus:outline-offset-2"
            style={{
              backgroundColor: 'var(--button-primary-bg)',
              color: 'var(--button-primary-text)',
              fontFamily: 'var(--font-body)',
              outlineColor: 'var(--focus-ring)',
            }}
            aria-label="Försök ladda sidan igen"
          >
            Försök igen
          </button>
          <Link
            href="/"
            className="rounded-lg px-6 py-3 text-lg font-semibold transition-all duration-300 hover:opacity-90 focus:outline-2 focus:outline-offset-2"
            style={{
              backgroundColor: 'var(--button-secondary-bg)',
              color: 'var(--button-secondary-text)',
              border: '2px solid var(--button-secondary-border)',
              fontFamily: 'var(--font-body)',
              outlineColor: 'var(--focus-ring)',
            }}
          >
            Tillbaka till startsidan
          </Link>
        </div>
      </div>
    </div>
  );
}
