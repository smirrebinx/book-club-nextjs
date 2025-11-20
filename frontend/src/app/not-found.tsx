import Link from 'next/link';

import LottieAnimation from '@/components/LottieAnimation';

export default function NotFound() {
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
          Sidan hittades inte
        </h1>

        {/* Description */}
        <p
          className="max-w-md text-lg leading-8"
          style={{
            fontFamily: 'var(--font-body)',
            color: 'var(--secondary-text)',
          }}
        >
          Oj! Sidan du letar efter verkar inte finnas. Den kan ha flyttats eller tagits bort.
        </p>

        {/* Action Button */}
        <Link
          href="/"
          className="mt-4 rounded-lg px-6 py-3 text-lg font-semibold transition-all duration-300 hover:opacity-90 focus:outline-2 focus:outline-offset-2"
          style={{
            backgroundColor: 'var(--button-primary-bg)',
            color: 'var(--button-primary-text)',
            fontFamily: 'var(--font-body)',
            outlineColor: 'var(--focus-ring)',
          }}
        >
          Tillbaka till startsidan
        </Link>
      </div>
    </div>
  );
}
