import Image from "next/image";
import { signOut } from "next-auth/react";

import type { Session } from "next-auth";

interface MobileUserAvatarProps {
  session: Session;
}

export default function MobileUserAvatar({ session }: MobileUserAvatarProps) {
  return (
    <button
      onClick={() => void signOut({ callbackUrl: "/auth/signin" })}
      className="flex h-11 w-11 items-center justify-center rounded-full transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-2 focus:outline-offset-2"
      style={{
        backgroundColor: "var(--secondary-bg)",
        outlineColor: "var(--focus-ring)",
      }}
      aria-label="Logga ut"
      title="Logga ut"
    >
      {session.user?.image ? (
        <Image
          src={session.user.image}
          alt={session.user.name || "User"}
          width={44}
          height={44}
          className="h-full w-full rounded-full"
        />
      ) : (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
          style={{ color: "var(--background)" }}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
          />
        </svg>
      )}
    </button>
  );
}
