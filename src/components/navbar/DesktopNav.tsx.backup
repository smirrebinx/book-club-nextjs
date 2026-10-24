import Link from "next/link";

interface NavLink {
  href: string;
  label: string;
}

interface DesktopNavProps {
  navLinks: NavLink[];
  pathname: string;
}

export default function DesktopNav({ navLinks, pathname }: DesktopNavProps) {
  return (
    <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-between lg:ml-10">
      <div className="flex items-center space-x-2">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive ? "page" : undefined}
              className={`group relative rounded-md px-4 py-2 text-sm transition-all duration-200 hover:bg-opacity-50 focus:outline-2 focus:outline-offset-2 ${
                isActive ? "font-bold" : "font-medium"
              }`}
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--secondary-text)",
                outlineColor: "var(--secondary-border)",
                backgroundColor: "transparent",
              }}
            >
              {link.label}
              {/* Active indicator underline */}
              {isActive && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ backgroundColor: "var(--secondary-border)" }}
                  aria-hidden="true"
                />
              )}
              {/* Hover underline */}
              <span
                className="absolute bottom-0 left-0 right-0 h-0.5 scale-x-0 transition-transform duration-200 group-hover:scale-x-100"
                style={{ backgroundColor: "var(--primary-border)" }}
                aria-hidden="true"
              />
            </Link>
          );
        })}
      </div>

      {/* User Avatar - Desktop */}
      <Link
        href="/login"
        className="group flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-200 hover:shadow-md focus:outline-2 focus:outline-offset-2"
        style={{
          fontFamily: "var(--font-body)",
          color: "var(--secondary-text)",
          borderColor: "var(--primary-border)",
          backgroundColor: "transparent",
          outlineColor: "var(--secondary-border)",
        }}
        aria-label="Logga in på ditt konto"
      >
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-110"
          style={{ backgroundColor: "var(--primary-bg)" }}
          aria-hidden="true"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            style={{ color: "var(--primary-text)" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
            />
          </svg>
        </div>
        <span>Logga in</span>
      </Link>
    </div>
  );
}
