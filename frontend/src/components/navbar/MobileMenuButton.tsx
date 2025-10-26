import type { RefObject } from "react";

interface MobileMenuButtonProps {
  isMobileMenuOpen: boolean;
  onClick: () => void;
  menuButtonRef: RefObject<HTMLButtonElement | null>;
}

export default function MobileMenuButton({
  isMobileMenuOpen,
  onClick,
  menuButtonRef,
}: MobileMenuButtonProps) {
  return (
    <button
      ref={menuButtonRef}
      type="button"
      onClick={onClick}
      aria-controls="mobile-menu"
      aria-expanded={isMobileMenuOpen}
      className="inline-flex h-11 w-11 items-center justify-center rounded-md border transition-all duration-200 hover:shadow-md active:scale-95 focus:outline-2 focus:outline-offset-2"
      style={{
        color: "var(--primary-text)",
        borderColor: "var(--primary-border)",
        backgroundColor: "transparent",
        outlineColor: "var(--secondary-border)",
      }}
      title={isMobileMenuOpen ? "Stäng meny" : "Öppna meny"}
    >
      <span className="sr-only">
        {isMobileMenuOpen ? "Stäng meny" : "Öppna meny"}
      </span>
      {/* Hamburger icon */}
      {!isMobileMenuOpen ? (
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      ) : (
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      )}
    </button>
  );
}
