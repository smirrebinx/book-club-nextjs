"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

import { Button } from "@/components/Button";
import GdprInfoModal from "@/components/GdprInfoModal";
import LottieAnimation from "@/components/LottieAnimation";
import { APP_NAME } from "@/constants";

export default function SignIn() {
  const [isGdprModalOpen, setIsGdprModalOpen] = useState(false);

  const handleGoogleSignIn = () => {
    void signIn("google", { callbackUrl: "/" });
  };

  return (
    <div
      className="flex min-h-screen items-start justify-center pt-16"
      style={{
        backgroundColor: "var(--background)",
      }}
    >
      <main className="flex w-full max-w-md flex-col items-center gap-8 px-4 py-8">
        <div className="flex w-full flex-col items-center gap-6 text-center">
          <LottieAnimation
            src="/animations/animationBooks.lottie"
            width={200}
            height={200}
            ariaLabel="Animerad bokklubbslogotyp"
            isDecorative={false}
          />

          <h1
            className="text-3xl leading-10 tracking-wide"
            style={{
              fontFamily: "var(--font-newyorker)",
              color: "var(--primary-text)",
            }}
          >
            {APP_NAME}
          </h1>
          <div className="flex w-full flex-col gap-4">
            {/* Google Sign In */}
            <Button
              onClick={handleGoogleSignIn}
              variant="secondary"
              size="lg"
              fullWidth
              className="flex items-center justify-center gap-3"
              aria-label="Logga in med Google"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="font-semibold">Logga in med Google</span>
            </Button>

            {/* GDPR Information Link */}
            <div className="mt-2 flex justify-center">
              <button
                onClick={() => setIsGdprModalOpen(true)}
                className="inline-flex items-center gap-2 rounded px-3 py-2 text-sm underline transition-opacity hover:opacity-70 focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{
                  color: "var(--secondary-text)",
                  fontFamily: "var(--font-body)",
                  "--tw-ring-color": "var(--focus-ring)",
                } as React.CSSProperties}
                type="button"
                aria-label="Läs information om personuppgifter"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
                Information om personuppgifter
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* GDPR Modal */}
      <GdprInfoModal
        isOpen={isGdprModalOpen}
        onClose={() => setIsGdprModalOpen(false)}
      />
    </div>
  );
}
