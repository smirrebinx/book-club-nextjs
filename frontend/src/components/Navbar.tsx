"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import DesktopNav from "@/components/navbar/DesktopNav";
import Logo from "@/components/navbar/Logo";
import MobileMenuButton from "@/components/navbar/MobileMenuButton";
import MobileNav from "@/components/navbar/MobileNav";

const navLinks = [
  { href: "/", label: "Hem" },
  { href: "/NextMeeting", label: "Nästa bokträff" },
  { href: "/BooksRead", label: "Lästa böcker" },
  { href: "/BookSuggestions", label: "Bokförslag" },
  { href: "/Vote", label: "Rösta" },
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
          <Logo />

          <DesktopNav navLinks={navLinks} pathname={pathname} />

          {/* Mobile: User Avatar and Menu Button */}
          <div className="flex items-center gap-3 lg:hidden">
            {/* User Avatar - Mobile */}
            <Link
              href="/login"
              className="flex h-11 w-11 items-center justify-center rounded-full transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-2 focus:outline-offset-2"
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

            <MobileMenuButton
              isMobileMenuOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              menuButtonRef={menuButtonRef}
            />
          </div>
        </div>
      </div>

      <MobileNav
        navLinks={navLinks}
        pathname={pathname}
        isMobileMenuOpen={isMobileMenuOpen}
        mobileMenuRef={mobileMenuRef}
      />
    </nav>
  );
}
