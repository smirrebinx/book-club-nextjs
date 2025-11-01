"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

import LottieAnimation from "@/components/LottieAnimation";
import { APP_NAME } from "@/constants";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signIn("nodemailer", { email, redirect: false });
      setEmailSent(true);
    } catch (error) {
      console.error("Error signing in:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    void signIn("google", { callbackUrl: "/" });
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{
        backgroundColor: "var(--background)",
      }}
    >
      <main className="flex w-full max-w-md flex-col items-center gap-8 px-4 py-8">
        <div className="flex w-full flex-col items-center gap-6 text-center">
          <LottieAnimation
            src="/animations/Calendar.lottie"
            width={150}
            height={150}
            ariaLabel="Bokklubbs logotyp"
            isDecorative={false}
          />

          <h1
            className="text-3xl leading-10 tracking-wide"
            style={{
              fontFamily: "var(--font-newyorker)",
              color: "var(--primary-text)",
            }}
          >
            Logga in till {APP_NAME}
          </h1>

          {emailSent ? (
            <div
              className="w-full rounded-lg border p-6"
              style={{
                borderColor: "var(--secondary-border)",
                backgroundColor: "var(--background)",
              }}
              role="status"
              aria-live="polite"
            >
              <p
                className="text-lg"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--secondary-text)",
                }}
              >
                Kolla din e-post! Vi har skickat en inloggningslänk till {email}
              </p>
            </div>
          ) : (
            <div className="flex w-full flex-col gap-4">
              {/* Google Sign In */}
              <button
                onClick={handleGoogleSignIn}
                className="flex w-full items-center justify-center gap-3 rounded-lg border px-6 py-3 transition-all hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{
                  borderColor: "var(--secondary-border)",
                  backgroundColor: "var(--secondary-bg)",
                  color: "var(--background)",
                  fontFamily: "var(--font-body)",
                }}
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
                <span className="font-semibold">Fortsätt med Google</span>
              </button>

              <div className="flex items-center gap-4" role="separator" aria-label="eller">
                <div className="h-px flex-1" style={{ backgroundColor: "var(--primary-border)" }}></div>
                <span
                  className="text-sm"
                  style={{
                    fontFamily: "var(--font-body)",
                    color: "var(--color-muted)",
                  }}
                >
                  eller
                </span>
                <div className="h-px flex-1" style={{ backgroundColor: "var(--primary-border)" }}></div>
              </div>

              {/* Email Sign In */}
              <form onSubmit={(e) => void handleEmailSignIn(e)} className="flex w-full flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="email"
                    className="text-left text-sm font-semibold"
                    style={{
                      color: "var(--primary-text)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    E-postadress
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="din@email.se"
                    className="rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-offset-2"
                    style={{
                      borderColor: "var(--secondary-border)",
                      backgroundColor: "var(--background)",
                      color: "var(--primary-text)",
                      fontFamily: "var(--font-body)",
                    }}
                    aria-required="true"
                    aria-describedby="email-hint"
                  />
                  <span
                    id="email-hint"
                    className="sr-only"
                  >
                    Ange din e-postadress för att få en inloggningslänk
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-lg px-6 py-3 font-semibold transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: "var(--secondary-bg)",
                    color: "var(--background)",
                    fontFamily: "var(--font-body)",
                  }}
                  aria-busy={isLoading}
                  aria-label={isLoading ? "Skickar inloggningslänk" : "Skicka inloggningslänk till din e-post"}
                >
                  {isLoading ? "Skickar..." : "Skicka inloggningslänk"}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
