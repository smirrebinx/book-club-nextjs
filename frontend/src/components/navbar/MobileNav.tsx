import Link from "next/link";

import type { RefObject } from "react";

interface NavLink {
  href: string;
  label: string;
}

interface MobileNavProps {
  navLinks: NavLink[];
  pathname: string;
  isMobileMenuOpen: boolean;
  mobileMenuRef: RefObject<HTMLDivElement | null>;
}

export default function MobileNav({
  navLinks,
  pathname,
  isMobileMenuOpen,
  mobileMenuRef,
}: MobileNavProps) {
  return (
    <>
      {/* Mobile menu backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 transition-opacity duration-300 lg:hidden"
          style={{
            backgroundColor: "rgba(128, 128, 128, 0.15)",
          }}
          onClick={() => {
            // This will be handled by parent component
          }}
          aria-hidden="true"
        />
      )}

      {/* Mobile menu */}
      <div
        ref={mobileMenuRef}
        id="mobile-menu"
        className={`lg:hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen
            ? "max-h-screen opacity-100"
            : "max-h-0 opacity-0 overflow-hidden"
        }`}
        style={{
          position: "relative",
          zIndex: 50,
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
    </>
  );
}
