"use client";

import { useEffect, useRef } from "react";

import { Button } from "@/components/Button";

interface GdprInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GdprInfoModal({ isOpen, onClose }: GdprInfoModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Handle focus management and keyboard navigation
  useEffect(() => {
    if (isOpen) {
      // Store the element that had focus before opening modal
      previousActiveElement.current = document.activeElement as HTMLElement;

      // Prevent body scroll
      document.body.style.overflow = "hidden";

      // Focus the close button when modal opens
      closeButtonRef.current?.focus();

      // Handle ESC key to close modal
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        }
      };

      // Focus trap - keep focus within modal
      const handleTab = (e: KeyboardEvent) => {
        if (e.key !== "Tab" || !modalRef.current) return;

        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      };

      document.addEventListener("keydown", handleEscape);
      document.addEventListener("keydown", handleTab);

      return () => {
        document.removeEventListener("keydown", handleEscape);
        document.removeEventListener("keydown", handleTab);
      };
    } else {
      // Restore body scroll
      document.body.style.overflow = "unset";

      // Return focus to the element that opened the modal
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gdpr-modal-title"
      aria-describedby="gdpr-modal-description"
    >
      {/* Backdrop - clickable to close */}
      <button
        className="absolute inset-0 cursor-default"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.75)",
        }}
        onClick={onClose}
        aria-label="Stäng dialog"
        type="button"
        tabIndex={-1}
      />

      {/* Modal Content */}
      <div
        ref={modalRef}
        className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border-2 p-6 shadow-xl"
        style={{
          backgroundColor: "var(--background)",
          borderColor: "var(--secondary-border)",
        }}
      >
        {/* Close button */}
        <button
          ref={closeButtonRef}
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 transition-opacity hover:opacity-70 focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={
            {
              color: "var(--primary-text)",
              "--tw-ring-color": "var(--focus-ring)",
            } as React.CSSProperties
          }
          aria-label="Stäng dialogruta om personuppgifter"
          type="button"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <h2
          id="gdpr-modal-title"
          className="mb-4 pr-8 text-2xl font-bold"
          style={{
            fontFamily: "var(--font-newyorker)",
            color: "var(--primary-text)",
          }}
        >
          Information om personuppgifter
        </h2>

        {/* Content */}
        <div
          id="gdpr-modal-description"
          className="space-y-4 text-base leading-relaxed"
          style={{
            fontFamily: "var(--font-body)",
            color: "var(--secondary-text)",
          }}
        >
          <p>
            När du loggar in på bokklubbens webbplats samlar vi in och sparar
            följande personuppgifter:
          </p>

          <div className="space-y-4">
            <div>
              <h3
                className="mb-2 text-lg font-semibold"
                style={{ color: "var(--primary-text)" }}
              >
                Uppgifter vi samlar in:
              </h3>
              <ul className="ml-6 list-disc space-y-1">
                <li>Ditt namn (hämtas från ditt Google-konto)</li>
                <li>Din e-postadress</li>
                <li>Profilbild (om tillgänglig från Google)</li>
              </ul>
            </div>

            <div>
              <h3
                className="mb-2 text-lg font-semibold"
                style={{ color: "var(--primary-text)" }}
              >
                Syfte med insamlingen:
              </h3>
              <ul className="ml-6 list-disc space-y-1">
                <li>Autentisering och identifiering av användare</li>
                <li>Kommunikation om bokklubben och möten</li>
                <li>Administrering av bokklubben</li>
              </ul>
            </div>

            <div>
              <h3
                className="mb-2 text-lg font-semibold"
                style={{ color: "var(--primary-text)" }}
              >
                Datalagring och säkerhet:
              </h3>
              <ul className="ml-6 list-disc space-y-1">
                <li>Dina uppgifter lagras säkert i vår databas</li>
                <li>Vi delar inte dina uppgifter med tredje part</li>
                <li>Du kan när som helst begära att få dina uppgifter raderade</li>
              </ul>
            </div>

            <div>
              <h3
                className="mb-2 text-lg font-semibold"
                style={{ color: "var(--primary-text)" }}
              >
                Dina rättigheter enligt GDPR:
              </h3>
              <ul className="ml-6 list-disc space-y-1">
                <li>Rätt till tillgång till dina personuppgifter</li>
                <li>Rätt att rätta felaktiga uppgifter</li>
                <li>Rätt att radera dina uppgifter (rätten att bli glömd)</li>
                <li>Rätt att begränsa behandlingen</li>
                <li>Rätt till dataportabilitet</li>
              </ul>
            </div>
          </div>

          <p className="pt-2 text-sm" style={{ color: "var(--secondary-text)" }}>
            Genom att logga in godkänner du att vi behandlar dina
            personuppgifter enligt ovan. Om du har frågor om hur vi hanterar
            dina personuppgifter, kontakta administratören för bokklubben.
          </p>
        </div>

        {/* Footer button */}
        <div className="mt-6 flex justify-end">
          <Button
            onClick={onClose}
            variant="secondary"
            size="lg"
            type="button"
            aria-label="Jag förstår och godkänner"
          >
            Jag förstår
          </Button>
        </div>
      </div>
    </div>
  );
}
