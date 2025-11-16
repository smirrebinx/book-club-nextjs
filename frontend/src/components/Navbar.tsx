"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

import DesktopNav from "@/components/navbar/DesktopNav";
import Logo from "@/components/navbar/Logo";
import MobileMenuButton from "@/components/navbar/MobileMenuButton";
import MobileNav from "@/components/navbar/MobileNav";
import MobileUserAvatar from "@/components/navbar/MobileUserAvatar";
import { usePendingCount } from "@/hooks/usePendingCount";

interface NavLink {
  href: string;
  label: string;
  badge?: number;
}

const getNavLinks = (role?: string, isApproved?: boolean, pendingCount?: number): NavLink[] => {
  const links: NavLink[] = [
    { href: "/", label: "Hem" },
  ];

  // Only show navigation links to approved users
  if (isApproved) {
    links.push(
      { href: "/NextMeeting", label: "Bokträffar" },
      { href: "/BooksRead", label: "Lästa böcker" },
      { href: "/suggestions", label: "Bokförslag" },
      { href: "/Vote", label: "Rösta" }
    );

    // Add admin link for admins with badge
    if (role === 'admin') {
      links.push({
        href: "/admin/users",
        label: "Admin",
        badge: pendingCount && pendingCount > 0 ? pendingCount : undefined
      });
    }
  }

  return links;
};

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Fetch pending user count for admins
  const pendingCount = usePendingCount(session?.user?.role === 'admin');

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Handle mobile menu interactions
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

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    }

    // Prevent body scroll when mobile menu is open
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  // Don't show navbar for pending users
  if (session?.user && !session.user.isApproved) {
    return null;
  }

  // Get navigation links based on user role and approval status
  const navLinks = getNavLinks(session?.user?.role, session?.user?.isApproved, pendingCount);

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

          {/* Only show navigation when logged in */}
          {session?.user && (
            <>
              <DesktopNav navLinks={navLinks} pathname={pathname} session={session} />

              {/* Mobile: User Avatar and Menu Button */}
              <div className="flex items-center gap-3 lg:hidden">
                <MobileUserAvatar session={session} />

                <MobileMenuButton
                  isMobileMenuOpen={isMobileMenuOpen}
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  menuButtonRef={menuButtonRef}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Only show mobile menu when logged in */}
      {session?.user && (
        <MobileNav
          navLinks={navLinks}
          pathname={pathname}
          isMobileMenuOpen={isMobileMenuOpen}
          mobileMenuRef={mobileMenuRef}
        />
      )}
    </nav>
  );
}
