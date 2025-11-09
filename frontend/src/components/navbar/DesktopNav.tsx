  "use client";

import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";

import type { Session } from "next-auth";

interface NavLink {
  href: string;
  label: string;
  badge?: number;
}

interface DesktopNavProps {
  navLinks: NavLink[];
  pathname: string;
  session: Session | null;
}

export default function DesktopNav({ navLinks, pathname, session }: DesktopNavProps) {
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
                outlineColor: "var(--focus-ring)",
                backgroundColor: "transparent",
              }}
            >
              <span className="flex items-center gap-2">
                {link.label}
                {link.badge && link.badge > 0 && (
                  <span
                    className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-bold"
                    style={{
                      backgroundColor: "var(--accent)",
                      color: "var(--background)",
                    }}
                    aria-label={`${link.badge} väntande användare`}
                  >
                    {link.badge}
                  </span>
                )}
              </span>
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
        {session?.user ? (
          <button
            onClick={() => void signOut({ callbackUrl: "/auth/signin" })}
            className="group flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-200 hover:shadow-md focus:outline-2
  focus:outline-offset-2"
            style={{
              fontFamily: "var(--font-body)",
              color: "var(--secondary-text)",
              borderColor: "var(--secondary-border)",
              backgroundColor: "transparent",
              outlineColor: "var(--focus-ring)",
            }}
            aria-label="Logga ut"
          >
            {session.user.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name || "User"}
                width={32}
                height={32}
                className="h-8 w-8 rounded-full transition-transform duration-200 group-hover:scale-110"
              />
            ) : (
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-110"
                style={{ backgroundColor: "var(--secondary-bg)" }}
                aria-hidden="true"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  style={{ color: "var(--background)" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                  />
                </svg>
              </div>
            )}
            <span>Logga ut</span>
          </button>
        ) : null}
    </div>
  );
}
