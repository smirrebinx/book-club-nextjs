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
          outlineColor: "var(--secondary-border)",
          textShadow:
            "0 1px 2px rgba(148, 177, 170, 0.3), 0 2px 4px rgba(148, 177, 170, 0.2)",
        }}
      >
        Barnfria bokklubben
        {/* Book icon */}
        <svg
          className="h-5 w-5 sm:h-6 sm:w-6"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Book cover */}
          <path
            d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H20"
            stroke="var(--secondary-border)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6.5 2H20V22H6.5C5.83696 22 5.20107 21.7366 4.73223 21.2678C4.26339 20.7989 4 20.163 4 19.5V4.5C4 3.83696 4.26339 3.20107 4.73223 2.73223C5.20107 2.26339 5.83696 2 6.5 2Z"
            stroke="var(--primary-bg)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="var(--primary-bg)"
            fillOpacity="0.15"
          />
          {/* Book pages */}
          <path
            d="M8 7H16M8 11H16"
            stroke="var(--secondary-border)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </Link>
    </div>
  );
}
