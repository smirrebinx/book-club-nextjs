'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function AdminMobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden bg-white shadow-md p-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Administration</h2>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors focus:outline-2 focus:outline-offset-2"
          aria-label="Toggle menu"
          style={{ outlineColor: "var(--focus-ring)" }}
        >
          <svg
            className="h-6 w-6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isOpen ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-md border-t border-gray-200">
          <nav className="p-4 space-y-2">
            <Link
              href="/admin/users"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors focus:outline-2 focus:outline-offset-2"
              style={{ outlineColor: "var(--focus-ring)" }}
            >
              Användare
            </Link>
            <Link
              href="/admin/suggestions"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors focus:outline-2 focus:outline-offset-2"
              style={{ outlineColor: "var(--focus-ring)" }}
            >
              Bokförslag
            </Link>
            <Link
              href="/admin/meetings"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors focus:outline-2 focus:outline-offset-2"
              style={{ outlineColor: "var(--focus-ring)" }}
            >
              Möten
            </Link>
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-3 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors mt-4 border-t border-gray-200 pt-4 focus:outline-2 focus:outline-offset-2"
              style={{ outlineColor: "var(--focus-ring)" }}
            >
              ← Tillbaka till hemsidan
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
