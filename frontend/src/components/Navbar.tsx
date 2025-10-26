"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { APP_NAME } from "@/constants";

const navLinks = [
  { href: "/", label: "Hem" },
  { href: "/next-meeting", label: "Nästa bokträff" },
  { href: "/books-read", label: "Lästa böcker" },
  { href: "/book-suggestions", label: "Bokförslag" },
  { href: "/vote", label: "Rösta" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isMobileMenuOpen &&
        mobileMenuRef.current &&
        menuButtonRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        !menuButtonRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileMenuOpen]);

  // Handle escape key to close mobile menu
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <nav
      aria-label="Huvudnavigering"
      className="sticky top-0 z-50 w-full border-b"
      style={{
        backgroundColor: "var(--background)",
        borderColor: "var(--primary-border)",
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="text-xl font-bold focus:outline-2 focus:outline-offset-4"
              style={{
                fontFamily: "var(--font-newyorker)",
                color: "var(--primary-text)",
                outlineColor: "var(--secondary-border)",
              }}
            >
              {APP_NAME}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:flex-1 md:items-center md:justify-between md:ml-10">
            <div className="flex items-center space-x-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`rounded-md px-3 py-2 text-sm transition-colors focus:outline-2 focus:outline-offset-2 ${
                      isActive ? "font-bold" : "font-medium"
                    }`}
                    style={{
                      fontFamily: "var(--font-body)",
                      color: "var(--secondary-text)",
                      outlineColor: "var(--secondary-border)",
                    }}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* User Avatar - Desktop */}
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors focus:outline-2 focus:outline-offset-2"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--secondary-text)",
                outlineColor: "var(--secondary-border)",
              }}
              aria-label="Logga in på ditt konto"
            >
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full"
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

          {/* Mobile: User Avatar and Menu Button */}
          <div className="flex items-center gap-3 md:hidden">
            {/* User Avatar - Mobile */}
            <Link
              href="/login"
              className="flex h-8 w-8 items-center justify-center rounded-full transition-colors focus:outline-2 focus:outline-offset-2"
              style={{
                backgroundColor: "var(--primary-bg)",
                outlineColor: "var(--secondary-border)",
              }}
              aria-label="Logga in på ditt konto"
              title="Logga in på ditt konto"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                style={{ color: "var(--primary-text)" }}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
            </Link>

            {/* Hamburger Menu Button */}
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
              className="inline-flex items-center justify-center rounded-md border p-2 transition-colors focus:outline-2 focus:outline-offset-2"
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
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        ref={mobileMenuRef}
        id="mobile-menu"
        className="md:hidden"
        style={{
          display: isMobileMenuOpen ? "block" : "none",
        }}
      >
        <div
          className="flex flex-col items-center gap-3 px-4 pb-4 pt-3"
          style={{ backgroundColor: "var(--background)" }}
        >
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`block w-full max-w-sm rounded-lg border px-4 py-3 text-center text-base transition-all focus:outline-2 focus:outline-offset-2 ${
                  isActive ? "font-bold" : "font-medium"
                }`}
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--secondary-text)",
                  backgroundColor: "var(--background)",
                  borderColor: "var(--primary-border)",
                  outlineColor: "var(--secondary-border)",
                  boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
