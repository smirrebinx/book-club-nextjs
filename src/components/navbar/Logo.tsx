import Link from "next/link";

export default function Logo() {
  return (
    <div className="flex-shrink-0">
      <Link
        href="/"
        className="flex items-center gap-2 text-lg font-bold transition-all duration-200 hover:opacity-80 focus:outline-2 focus:outline-offset-4 sm:text-xl"
        style={{
          fontFamily: "var(--font-newyorker)",
          color: "var(--primary-text)",
          outlineColor: "var(--focus-ring)",
          textShadow:
            "0 1px 2px rgba(148, 177, 170, 0.3), 0 2px 4px rgba(148, 177, 170, 0.2)",
        }}
      >
        Barnfria bokklubben
        {/* Book icon - Stacked Books */}
        <svg
          className="h-5 w-5 sm:h-6 sm:w-6"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Bottom book (largest) */}
          <rect
            x="3"
            y="15"
            width="14"
            height="6"
            rx="0.5"
            fill="var(--primary-bg)"
            fillOpacity="0.4"
            stroke="var(--primary-bg)"
            strokeWidth="1.5"
          />
          {/* Bottom book spine */}
          <path
            d="M3 15L3 21"
            stroke="var(--secondary-border)"
            strokeWidth="2"
          />

          {/* Middle book (medium, slightly offset) */}
          <rect
            x="5"
            y="9"
            width="13"
            height="5"
            rx="0.5"
            fill="var(--secondary-border)"
            fillOpacity="0.5"
            stroke="var(--secondary-border)"
            strokeWidth="1.5"
          />
          {/* Middle book detail line */}
          <line
            x1="7"
            y1="11"
            x2="14"
            y2="11"
            stroke="var(--primary-bg)"
            strokeWidth="1"
            strokeOpacity="0.6"
          />

          {/* Top book (smallest, angled) */}
          <path
            d="M7 4L19 6L18 10L6 8L7 4Z"
            fill="var(--primary-bg)"
            fillOpacity="0.6"
            stroke="var(--primary-bg)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Top book detail */}
          <line
            x1="9"
            y1="6.5"
            x2="15"
            y2="7.5"
            stroke="var(--secondary-border)"
            strokeWidth="1"
            strokeOpacity="0.5"
          />
        </svg>
      </Link>
    </div>
  );
}
